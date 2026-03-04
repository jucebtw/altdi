const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProducts = async (req, res) => {
  try {
    const {
      sort = 'priority_desc',
      price_min,
      price_max,
      category,
      material,
      search,
    } = req.query;

    // Построение фильтров
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
    
    if (search) {
      // SQLite в Prisma поддерживает contains (использует LIKE под капотом)
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Построение сортировки
    // Prisma поддерживает только один orderBy объект или массив с одним объектом
    // Для множественной сортировки нужно использовать массив объектов
    let orderBy;
    
    if (sort === 'price_asc') {
      orderBy = [
        { priorityLevel: 'desc' },
        { price: 'asc' },
      ];
    } else if (sort === 'price_desc') {
      orderBy = [
        { priorityLevel: 'desc' },
        { price: 'desc' },
      ];
    } else {
      // priority_desc - по умолчанию
      orderBy = [
        { priorityLevel: 'desc' },
        { createdAt: 'desc' },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        master: {
          select: {
            id: true,
            fio: true,
            telegramId: true,
          },
        },
      },
    });

    res.json(products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    })));
  } catch (error) {
    console.error('Ошибка получения каталога:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        master: {
          select: {
            id: true,
            fio: true,
            telegramId: true,
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
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getMaterials = async (req, res) => {
  try {
    const materials = await prisma.product.findMany({
      select: { material: true },
      distinct: ['material'],
    });

    res.json(materials.map(m => m.material));
  } catch (error) {
    console.error('Ошибка получения материалов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getCategories,
  getMaterials,
};
