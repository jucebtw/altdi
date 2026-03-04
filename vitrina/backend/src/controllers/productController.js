import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const productSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  material: z.string().min(1),
  images: z.array(z.string()).optional(),
});

// Master: Get own products
export const getMasterProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { masterId: req.user.id },
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

// Master: Create product
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, material } = productSchema.parse(req.body);
    
    // Get uploaded images
    const images = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        material,
        images: JSON.stringify(images),
        masterId: req.user.id,
      },
    });

    res.status(201).json({
      ...product,
      images: JSON.parse(product.images || '[]'),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка создания товара:', error);
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
};

// Master: Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = productSchema.partial().parse(req.body);

    // Check ownership
    const product = await prisma.product.findFirst({
      where: { id: parseInt(id), masterId: req.user.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      const existingImages = JSON.parse(product.images || '[]');
      updateData.images = JSON.stringify([...existingImages, ...newImages]);
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

// Master: Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { id: parseInt(id), masterId: req.user.id },
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
