const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        master: {
          select: {
            id: true,
            fio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    })));
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fio: true,
        role: true,
        telegramId: true,
        verified: true,
        createdAt: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateProductSchema = Joi.object({
      title: Joi.string().min(1).max(200),
      description: Joi.string().min(1).max(2000),
      price: Joi.number().positive(),
      category: Joi.string(),
      material: Joi.string(),
      priorityLevel: Joi.number().integer().min(0),
      sizeBoost: Joi.number().integer().min(0),
      masterId: Joi.number().integer(),
    });

    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: value,
    });

    res.json({
      ...updatedProduct,
      images: JSON.parse(updatedProduct.images || '[]'),
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const path = require('path');
    const fs = require('fs').promises;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
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

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Нельзя удалить самого себя
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllProducts,
  getAllUsers,
  updateProduct,
  deleteProduct,
  deleteUser,
};
