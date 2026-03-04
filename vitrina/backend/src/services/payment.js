const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Базовый URL для YooKassa API
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

// Уровни продвижения
const PROMOTION_LEVELS = {
  1: {
    price: 1000,
    priorityBoost: 5,
    sizeBoost: 1,
    name: 'Базовое продвижение',
  },
  2: {
    price: 2000,
    priorityBoost: 10,
    sizeBoost: 2,
    name: 'Стандартное продвижение',
  },
  3: {
    price: 3000,
    priorityBoost: 15,
    sizeBoost: 3,
    name: 'Премиум продвижение',
  },
};

// Создание базовой авторизации для YooKassa
const getAuthHeader = () => {
  const credentials = Buffer.from(
    `${config.yookassa.shopId}:${config.yookassa.secretKey}`
  ).toString('base64');
  return `Basic ${credentials}`;
};

const createPayment = async (productId, level, userId) => {
  try {
    const promotion = PROMOTION_LEVELS[level];
    if (!promotion) {
      throw new Error('Неверный уровень продвижения');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Товар не найден');
    }

    // Проверка прав (только мастер товара или админ)
    if (product.masterId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user.role !== 'Admin') {
        throw new Error('Недостаточно прав');
      }
    }

    // Проверка наличия учетных данных YooKassa
    if (!config.yookassa.shopId || !config.yookassa.secretKey) {
      throw new Error('YooKassa не настроен. Укажите YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env');
    }

    // Формирование URL для возврата (используем frontend URL)
    const returnUrl = `${config.frontendUrl || `https://${config.domain}`}/payment/success`;

    // Создание платежа через YooKassa API
    const paymentData = {
      amount: {
        value: promotion.price.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      description: `Продвижение товара "${product.title}" - ${promotion.name}`,
      metadata: {
        productId: productId.toString(),
        userId: userId.toString(),
        level: level.toString(),
      },
    };

    const response = await axios.post(
      `${YOOKASSA_API_URL}/payments`,
      paymentData,
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
          'Idempotence-Key': `${productId}-${level}-${Date.now()}`,
        },
      }
    );

    const payment = response.data;

    return {
      id: payment.id,
      status: payment.status,
      confirmation_url: payment.confirmation?.confirmation_url,
    };
  } catch (error) {
    console.error('Ошибка создания платежа:', error.response?.data || error.message);
    throw error;
  }
};

const handleWebhook = async (event) => {
  try {
    // YooKassa отправляет события в формате { event: 'payment.succeeded', object: {...} }
    if (event.event === 'payment.succeeded') {
      const payment = event.object;
      const { productId, userId, level } = payment.metadata || {};

      if (!productId || !userId || !level) {
        console.error('Отсутствуют метаданные платежа');
        return;
      }

      const promotion = PROMOTION_LEVELS[parseInt(level)];
      if (!promotion) {
        console.error('Неверный уровень продвижения');
        return;
      }

      // Обновление товара
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });

      if (!product) {
        console.error('Товар не найден');
        return;
      }

      await prisma.product.update({
        where: { id: parseInt(productId) },
        data: {
          priorityLevel: product.priorityLevel + promotion.priorityBoost,
          sizeBoost: product.sizeBoost + promotion.sizeBoost,
        },
      });

      console.log(`Продвижение применено к товару ${productId}`);
    }
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
  }
};

module.exports = {
  createPayment,
  handleWebhook,
  PROMOTION_LEVELS,
};
