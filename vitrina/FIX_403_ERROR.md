# Исправление ошибки 403 (Forbidden)

Выполните эти команды на сервере для исправления ошибки 403:

```bash
cd /var/www/vitrina/backend

# 1. Обновить authMiddleware с улучшенной обработкой ошибок
cat > src/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.error('Auth middleware: Authorization header missing');
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('Auth middleware: Token missing from header');
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.error('Auth middleware: User not found for id:', decoded.userId);
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный токен' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истек' });
    }
    res.status(401).json({ error: 'Ошибка аутентификации' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    
    next();
  };
};

module.exports = { authMiddleware, requireRole };
EOF

# 2. Убедиться, что masterRoutes.js не проверяет роль
cat > src/routes/masterRoutes.js << 'EOF'
const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const productController = require('../controllers/productController');

const router = express.Router();

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
  },
});

// Все routes требуют авторизации (любой зарегистрированный пользователь может добавлять товары)
router.use(authMiddleware);
// Убрали проверку роли - теперь все зарегистрированные пользователи могут добавлять товары

router.get('/products', productController.getMasterProducts);
router.post('/products', upload.array('images', 10), productController.createProduct);
router.put('/products/:id', upload.array('images', 10), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
EOF

# 3. Перезапустить backend
pm2 restart vitrina-backend

# 4. Проверить логи
pm2 logs vitrina-backend --lines 20
```

После выполнения команд:
1. Проверьте логи - должны появиться более детальные сообщения об ошибках
2. Попробуйте снова добавить товар
3. Если ошибка сохраняется, проверьте в консоли браузера, передается ли токен в заголовке Authorization
