# Исправление ошибки 500 при создании товара

Выполните эту команду на сервере:

```bash
cd /var/www/vitrina/backend

# Обновить productController.js
cat > src/controllers/productController.js << 'PRODUCTCONTROLLER_EOF'
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const path = require('path');
const fs = require('fs').promises;

const prisma = new PrismaClient();

const createProductSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(2000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  material: Joi.string().required(),
  priorityLevel: Joi.number().integer().min(0).default(0),
  sizeBoost: Joi.number().integer().min(0).default(0),
});

const updateProductSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().min(1).max(2000),
  price: Joi.number().positive(),
  category: Joi.string(),
  material: Joi.string(),
  priorityLevel: Joi.number().integer().min(0),
  sizeBoost: Joi.number().integer().min(0),
});

// Получить все товары мастера
const getMasterProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { masterId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products.map(p => {
      let images = [];
      try {
        images = p.images ? JSON.parse(p.images) : [];
      } catch (e) {
        console.error('Ошибка парсинга images для продукта', p.id, e);
        images = [];
      }
      return {
        ...p,
        images,
      };
    }));
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создать товар
const createProduct = async (req, res) => {
  try {
    // При multipart/form-data данные приходят в req.body как строки
    const productData = {
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      material: req.body.material,
      priorityLevel: req.body.priorityLevel ? parseInt(req.body.priorityLevel) : 0,
      sizeBoost: req.body.sizeBoost ? parseInt(req.body.sizeBoost) : 0,
    };

    // Валидация
    const { error, value } = createProductSchema.validate(productData);
    if (error) {
      console.error('Validation error:', error.details);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Обработка загруженных файлов
    const imageFiles = req.files || [];
    const imagePaths = imageFiles.map(file => `/uploads/${file.filename}`);

    const product = await prisma.product.create({
      data: {
        ...value,
        masterId: req.user.id,
        images: JSON.stringify(imagePaths),
      },
    });

    res.status(201).json({
      ...product,
      images: JSON.parse(product.images),
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Обновить товар
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // При multipart/form-data данные приходят в req.body как строки
    const productData = {};
    if (req.body.title) productData.title = req.body.title;
    if (req.body.description) productData.description = req.body.description;
    if (req.body.price) productData.price = parseFloat(req.body.price);
    if (req.body.category) productData.category = req.body.category;
    if (req.body.material) productData.material = req.body.material;
    if (req.body.priorityLevel) productData.priorityLevel = parseInt(req.body.priorityLevel);
    if (req.body.sizeBoost) productData.sizeBoost = parseInt(req.body.sizeBoost);

    const { error, value } = updateProductSchema.validate(productData);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Проверка прав доступа
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Мастер может редактировать только свои товары, админ - любые
    if (req.user.role !== 'Admin' && product.masterId !== req.user.id) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    // Обработка новых изображений, если есть
    let images = product.images ? JSON.parse(product.images) : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...value,
        images: JSON.stringify(images),
      },
    });

    res.json({
      ...updatedProduct,
      images: JSON.parse(updatedProduct.images),
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить товар
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Проверка прав доступа
    if (req.user.role !== 'Admin' && product.masterId !== req.user.id) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    // Удаление изображений
    if (product.images) {
      const images = JSON.parse(product.images);
      for (const imagePath of images) {
        try {
          const fullPath = path.join(__dirname, '../../..', imagePath);
          await fs.unlink(fullPath);
        } catch (err) {
          console.error('Ошибка удаления файла:', err);
        }
      }
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  getMasterProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
PRODUCTCONTROLLER_EOF

# Перезапустить backend
pm2 restart vitrina-backend

# Проверить логи
pm2 logs vitrina-backend --lines 30
```
