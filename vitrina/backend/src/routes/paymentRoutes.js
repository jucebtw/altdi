import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createPaymentRoute, paymentWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create', authenticate, createPaymentRoute);
router.post('/webhook', paymentWebhook); // No auth for webhook

export default router;
