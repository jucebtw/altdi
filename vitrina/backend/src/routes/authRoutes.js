const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: 'Слишком много попыток регистрации, попробуйте позже',
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток верификации, попробуйте позже',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток входа, попробуйте позже',
});

router.post('/register', registerLimiter, authController.register);
router.post('/verify', verifyLimiter, authController.verify);
router.post('/login', loginLimiter, authController.login);

module.exports = router;
