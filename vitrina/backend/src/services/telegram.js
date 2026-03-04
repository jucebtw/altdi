import { Telegraf } from 'telegraf';
import { config } from '../config.js';

const bot = new Telegraf(config.telegramBotToken);

// Store verification codes in memory (in production, use Redis)
const verificationCodes = new Map();

export const sendVerificationCode = async (telegramUsername, code) => {
  try {
    // Try to find user by username
    const chat = await bot.telegram.getChat(`@${telegramUsername}`);
    
    if (chat && chat.id) {
      await bot.telegram.sendMessage(
        chat.id,
        `Ваш код верификации: ${code}\nИспользуйте его для подтверждения регистрации.`
      );
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка отправки кода в Telegram:', error);
    return false;
  }
};

export const storeVerificationCode = (telegramUsername, code) => {
  verificationCodes.set(telegramUsername, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
};

export const verifyCode = (telegramUsername, code) => {
  const stored = verificationCodes.get(telegramUsername);
  
  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(telegramUsername);
    return false;
  }

  if (stored.code === code) {
    verificationCodes.delete(telegramUsername);
    return true;
  }

  return false;
};

// Initialize bot
bot.launch().catch(console.error);

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
