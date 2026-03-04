import { config } from '../config.js';
import { PrismaClient } from '@prisma/client';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Yookassa SDK - используем простую реализацию через fetch
// В продакшене используйте официальный SDK
const createYooCheckoutPayment = async (amount, description, metadata, returnUrl) => {
  const auth = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.secretKey}`).toString('base64');
  
  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
      'Idempotence-Key': `payment-${Date.now()}-${Math.random()}`,
    },
    body: JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      description,
      metadata,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yookassa API error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

const getYooCheckoutPayment = async (paymentId) => {
  const auth = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.secretKey}`).toString('base64');
  
  const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yookassa API error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

export const createPayment = async (productId, level) => {
  try {
    if (!config.yookassa.shopId || !config.yookassa.secretKey) {
      throw new Error('Yookassa не настроен. Укажите YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Товар не найден');
    }

    // Level mapping: 1000 руб = priority+5/size+1
    const amount = level * 1000;
    const priorityBoost = level * 5;
    const sizeBoost = level;

    const payment = await createYooCheckoutPayment(
      amount,
      `Продвижение товара "${product.title}" - уровень ${level}`,
      {
        productId: productId.toString(),
        level: level.toString(),
        priorityBoost: priorityBoost.toString(),
        sizeBoost: sizeBoost.toString(),
      },
      `https://${config.domain}/payment/success`
    );

    return payment;
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    throw error;
  }
};

export const handlePaymentSuccess = async (paymentId) => {
  try {
    if (!config.yookassa.shopId || !config.yookassa.secretKey) {
      throw new Error('Yookassa не настроен');
    }

    const payment = await getYooCheckoutPayment(paymentId);

    if (payment.status === 'succeeded') {
      const { productId, priorityBoost, sizeBoost } = payment.metadata || {};

      if (!productId) {
        return false;
      }

      // Update product
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });

      if (product) {
        await prisma.product.update({
          where: { id: parseInt(productId) },
          data: {
            priorityLevel: product.priorityLevel + parseInt(priorityBoost || 0),
            sizeBoost: product.sizeBoost + parseInt(sizeBoost || 0),
          },
        });
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Ошибка обработки платежа:', error);
    throw error;
  }
};
