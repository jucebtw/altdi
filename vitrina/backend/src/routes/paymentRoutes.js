const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const paymentService = require('../services/payment');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Создание платежа (требует авторизации)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { productId, level } = req.body;

    if (!productId || !level) {
      return res.status(400).json({ error: 'Требуются productId и level' });
    }

    const payment = await paymentService.createPayment(
      parseInt(productId),
      parseInt(level),
      req.user.id
    );

    res.json(payment);
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера' });
  }
});

// Webhook от YooKassa
router.post('/webhook', express.json(), async (req, res) => {
  try {
    // YooKassa отправляет события в формате JSON
    // В реальном приложении нужно проверить подпись запроса
    // Для проверки подписи используйте заголовок X-YooMoney-Signature
    const event = req.body;
    
    await paymentService.handleWebhook(event);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Ошибка webhook:', error);
    res.status(500).send('Error');
  }
});

// Получить уровни продвижения
router.get('/levels', (req, res) => {
  res.json(paymentService.PROMOTION_LEVELS);
});

module.exports = router;
