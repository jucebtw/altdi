import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, verify, login } from '../controllers/authController.js';

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Слишком много попыток, попробуйте позже',
});

router.post('/register', authLimiter, register);
router.post('/verify', authLimiter, verify);
router.post('/login', authLimiter, login);

export default router;
