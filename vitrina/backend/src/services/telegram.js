const { Telegraf } = require('telegraf');
const config = require('../config');

const bot = new Telegraf(config.tgBotToken);

// Хранилище кодов верификации (в продакшене использовать Redis)
const verificationCodes = new Map();

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationCode = async (telegramUsername, code) => {
  try {
    // Убираем @ если есть
    const username = telegramUsername.replace('@', '');
    
    // Пытаемся найти сохраненный chat_id
    const chatId = userChatIds.get(username);
    
    if (chatId) {
      // Отправляем по chat_id (надежный способ)
      await bot.telegram.sendMessage(
        chatId,
        `Ваш код верификации: ${code}\n\nВведите этот код на сайте для завершения регистрации.`
      );
      return true;
    } else {
      // Если chat_id не найден, пытаемся отправить по username
      // Это работает только если пользователь уже писал боту
      try {
        await bot.telegram.sendMessage(
          `@${username}`,
          `Ваш код верификации: ${code}\n\nВведите этот код на сайте для завершения регистрации.`
        );
        return true;
      } catch (err) {
        console.error('Не удалось отправить сообщение. Пользователь должен сначала написать боту /start');
        return false;
      }
    }
  } catch (error) {
    console.error('Ошибка отправки кода в Telegram:', error);
    return false;
  }
};

const storeCode = (telegramUsername, code, userId) => {
  verificationCodes.set(telegramUsername, {
    code,
    userId,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 минут
  });
};

const verifyCode = (telegramUsername, code) => {
  const stored = verificationCodes.get(telegramUsername);
  
  if (!stored) {
    return { valid: false, error: 'Код не найден' };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(telegramUsername);
    return { valid: false, error: 'Код истек' };
  }
  
  if (stored.code !== code) {
    return { valid: false, error: 'Неверный код' };
  }
  
  verificationCodes.delete(telegramUsername);
  return { valid: true, userId: stored.userId };
};

// Хранилище chat_id по username (в продакшене использовать Redis или БД)
const userChatIds = new Map();

// Инициализация бота
bot.start((ctx) => {
  const username = ctx.from.username;
  const chatId = ctx.chat.id;
  
  if (username) {
    // Сохраняем chat_id для последующей отправки сообщений
    userChatIds.set(username, chatId);
    ctx.reply(
      `Привет, ${ctx.from.first_name || username}!\n\n` +
      `Я бот для верификации. Ваш username: @${username}\n` +
      `Используйте этот username при регистрации на сайте.`
    );
  } else {
    ctx.reply('Пожалуйста, установите username в настройках Telegram для использования бота.');
  }
});

// Обработка любого текстового сообщения для сохранения chat_id
bot.on('text', (ctx) => {
  const username = ctx.from.username;
  const chatId = ctx.chat.id;
  
  if (username) {
    userChatIds.set(username, chatId);
  }
});

bot.launch().catch(console.error);

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = {
  sendVerificationCode,
  storeCode,
  verifyCode,
  bot,
  userChatIds, // Экспортируем для возможности очистки/управления
};
