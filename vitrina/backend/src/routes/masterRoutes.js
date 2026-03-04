const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware, requireRole } = require('../middleware/auth');
const productController = require('../controllers/productController');

const router = express.Router();

// Настройка multer для загрузки изображений
const uploadsDir = path.join(__dirname, '../../uploads');
const fs = require('fs');

// Создать директорию uploads, если её нет
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
