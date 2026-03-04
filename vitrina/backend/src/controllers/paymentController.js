import { z } from 'zod';
import { createPayment, handlePaymentSuccess } from '../services/payment.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const paymentSchema = z.object({
  productId: z.number().int().positive(),
  level: z.number().int().min(1).max(10),
});

export const createPaymentRoute = async (req, res) => {
  try {
    const { productId, level } = paymentSchema.parse(req.body);

    // Verify ownership (Master) or allow Admin
    if (req.user.role !== 'Admin') {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.masterId !== req.user.id) {
        return res.status(403).json({ error: 'Нет доступа к этому товару' });
      }
    }

    const payment = await createPayment(productId, level);

    res.json({
      paymentUrl: payment.confirmation.confirmation_url,
      paymentId: payment.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    const { event, object } = req.body;

    if (event === 'payment.succeeded' && object.id) {
      await handlePaymentSuccess(object.id);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Ошибка webhook:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
};
