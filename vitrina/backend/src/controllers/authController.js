import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { config } from '../config.js';
import { sendVerificationCode, storeVerificationCode, verifyCode } from '../services/telegram.js';

const prisma = new PrismaClient();

const registerSchema = z.object({
  fio: z.string().min(2).max(100),
  password: z.string().min(6),
  telegram_username: z.string().min(1),
});

const verifySchema = z.object({
  telegram_username: z.string().min(1),
  code: z.string().length(6),
});

const loginSchema = z.object({
  fio: z.string().min(2),
  password: z.string().min(6),
});

export const register = async (req, res) => {
  try {
    const { fio, password, telegram_username } = registerSchema.parse(req.body);

    // Check if user exists
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

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code
    storeVerificationCode(telegram_username, code);

    // Send code via Telegram
    const sent = await sendVerificationCode(telegram_username, code);
    
    if (!sent) {
      return res.status(400).json({ error: 'Не удалось отправить код в Telegram. Проверьте username.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create unverified user
    const user = await prisma.user.create({
      data: {
        fio,
        passwordHash,
        telegramId: telegram_username,
        verified: false,
      },
    });

    res.json({ 
      message: 'Код верификации отправлен в Telegram',
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
};

export const verify = async (req, res) => {
  try {
    const { telegram_username, code } = verifySchema.parse(req.body);

    // Verify code
    if (!verifyCode(telegram_username, code)) {
      return res.status(400).json({ error: 'Неверный или истекший код' });
    }

    // Find and verify user
    const user = await prisma.user.findFirst({
      where: { telegramId: telegram_username },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'Пользователь уже верифицирован' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: updatedUser.id, role: updatedUser.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Верификация успешна',
      token,
      user: {
        id: updatedUser.id,
        fio: updatedUser.fio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка верификации:', error);
    res.status(500).json({ error: 'Ошибка верификации' });
  }
};

export const login = async (req, res) => {
  try {
    const { fio, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findFirst({
      where: { fio },
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    if (!user.verified) {
      return res.status(401).json({ error: 'Пользователь не верифицирован' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Generate JWT
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
};
