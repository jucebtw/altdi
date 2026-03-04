require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  tgBotToken: process.env.TG_BOT_TOKEN,
  domain: process.env.DOMAIN || 'localhost',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  yookassa: {
    shopId: process.env.YOOKASSA_SHOP_ID,
    secretKey: process.env.YOOKASSA_SECRET_KEY,
  },
  uploadsPath: process.env.UPLOADS_PATH || './uploads',
};
