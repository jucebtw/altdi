import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  try {
    const {
      sort = 'priority_desc',
      price_min,
      price_max,
      category,
      material,
      search,
    } = req.query;

    // Build where clause
    const where = {};

    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price.gte = parseFloat(price_min);
      if (price_max) where.price.lte = parseFloat(price_max);
    }

    if (category) {
      where.category = category;
    }

    if (material) {
      where.material = material;
    }

    // SQLite doesn't support contains, use manual filtering or full-text search
    // For now, we'll filter in memory after fetching
    let searchTerm = search ? search.toLowerCase() : null;

    // Build orderBy
    let orderBy = [];

    if (sort === 'priority_desc') {
      orderBy = [{ priorityLevel: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'price_asc') {
      orderBy = [{ price: 'asc' }];
    } else if (sort === 'price_desc') {
      orderBy = [{ price: 'desc' }];
    } else {
      orderBy = [{ priorityLevel: 'desc' }, { createdAt: 'desc' }];
    }

    let products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        master: {
          select: {
            id: true,
            fio: true,
          },
        },
      },
    });

    // Filter by search term if provided (SQLite limitation)
    if (searchTerm) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    res.json(products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    })));
  } catch (error) {
    console.error('Ошибка получения каталога:', error);
    res.status(500).json({ error: 'Ошибка получения каталога' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        master: {
          select: {
            id: true,
            fio: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
    });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
};
