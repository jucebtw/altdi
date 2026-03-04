const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const config = require('../config');
const telegramService = require('../services/telegram');

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  fio: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(6).required(),
  telegram_username: Joi.string().required(),
});

const verifySchema = Joi.object({
  telegram_username: Joi.string().required(),
  code: Joi.string().length(6).required(),
});

const loginSchema = Joi.object({
  fio: Joi.string().required(),
  password: Joi.string().required(),
});

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fio, password, telegram_username } = value;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { fio },
          { telegramId: telegram_username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        fio,
        passwordHash,
        telegramId: telegram_username,
        role: 'User',
        verified: false,
      },
    });

    // Генерация и отправка кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    telegramService.storeCode(telegram_username, code, user.id);
    
    try {
      const sent = await telegramService.sendVerificationCode(telegram_username, code);
      
      if (!sent) {
        // Если не удалось отправить, НЕ удаляем пользователя сразу
        // Пользователь может ввести код вручную, если знает его
        // Или можно сделать повторную отправку
        console.warn(`Не удалось отправить код в Telegram для ${telegram_username}, но пользователь создан`);
        
        // Возвращаем успех, но с предупреждением
        // В реальном приложении можно добавить кнопку "Отправить код повторно"
        return res.status(200).json({ 
          message: 'Пользователь создан, но код не отправлен в Telegram',
          warning: 'Не удалось отправить код. Убедитесь, что вы написали боту /start в Telegram (@' + telegram_username + '). Вы можете попробовать зарегистрироваться снова или связаться с администратором.',
          user_id: user.id,
          // Для разработки можно вернуть код (в продакшене убрать!)
          code: process.env.NODE_ENV === 'development' ? code : undefined
        });
      }
    } catch (telegramError) {
      // Логируем ошибку Telegram
      console.error('Ошибка отправки в Telegram:', telegramError);
      // НЕ удаляем пользователя - он может попробовать верификацию позже
      return res.status(200).json({ 
        message: 'Пользователь создан, но возникла ошибка при отправке кода',
        warning: 'Ошибка отправки кода верификации. Попробуйте связаться с администратором или зарегистрироваться снова.',
        user_id: user.id
      });
    }

    res.json({
      message: 'Код верификации отправлен в Telegram',
      user_id: user.id,
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    console.error('Stack trace:', error.stack);
    
    // Более детальные сообщения об ошибках
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Пользователь с таким ФИО или Telegram уже существует' });
    }
    
    if (error.message && error.message.includes('Unique constraint')) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    
    // Проверка на ошибки Prisma
    if (error.code && error.code.startsWith('P')) {
      console.error('Prisma error:', error.code, error.meta);
      return res.status(500).json({ 
        error: 'Ошибка базы данных',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Ошибка сервера при регистрации',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const verify = async (req, res) => {
  try {
    const { error, value } = verifySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { telegram_username, code } = value;

    const result = telegramService.verifyCode(telegram_username, code);
    
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    // Обновление статуса верификации
    const user = await prisma.user.update({
      where: { id: result.userId },
      data: { verified: true },
    });

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Верификация успешна',
      token,
      user: {
        id: user.id,
        fio: user.fio,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Ошибка верификации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fio, password } = value;

    // Используем findFirst, так как fio не уникальное поле в схеме
    const user = await prisma.user.findFirst({
      where: { fio },
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    if (!user.verified) {
      return res.status(403).json({ error: 'Аккаунт не верифицирован' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fio: user.fio,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    console.error('Stack trace:', error.stack);
    
    // Более детальные сообщения об ошибках
    if (error.code && error.code.startsWith('P')) {
      console.error('Prisma error:', error.code, error.meta);
      return res.status(500).json({ 
        error: 'Ошибка базы данных при входе',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Ошибка сервера при входе',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  register,
  verify,
  login,
};
