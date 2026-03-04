import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const productUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  material: z.string().min(1).optional(),
  priorityLevel: z.number().int().optional(),
  sizeBoost: z.number().int().optional(),
  images: z.array(z.string()).optional(),
});

// Admin: Get all products
export const getAllProducts = async (req, res) => {
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
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
};

// Admin: Update product
export const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = productUpdateSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Handle images if provided
    if (updateData.images) {
      updateData.images = JSON.stringify(updateData.images);
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({
      ...updated,
      images: JSON.parse(updated.images || '[]'),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
};

// Admin: Delete product
export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
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
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
};
