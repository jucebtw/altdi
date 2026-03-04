const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Данные администратора по умолчанию
const ADMIN_DATA = {
  fio: 'Администратор',
  password: 'Admin123!', // Пароль можно изменить
  telegramId: 'admin',
  role: 'Admin',
};

async function createDefaultAdmin() {
  try {
    console.log('🔐 Создание администратора по умолчанию...\n');

    // Проверка существования админа
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { fio: ADMIN_DATA.fio },
          { telegramId: ADMIN_DATA.telegramId },
          { role: 'Admin' },
        ],
      },
    });

    if (existing) {
      console.log('⚠️  Администратор уже существует!');
      console.log(`   ФИО: ${existing.fio}`);
      console.log(`   Роль: ${existing.role}`);
      console.log(`   ID: ${existing.id}`);
      
      // Обновить пароль, если нужно
      const updatePassword = process.argv.includes('--update-password');
      if (updatePassword) {
        const passwordHash = await bcrypt.hash(ADMIN_DATA.password, 10);
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash },
        });
        console.log('✅ Пароль обновлен!');
      }
      
      await prisma.$disconnect();
      return;
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(ADMIN_DATA.password, 10);

    // Создание администратора
    const admin = await prisma.user.create({
      data: {
        fio: ADMIN_DATA.fio,
        passwordHash,
        telegramId: ADMIN_DATA.telegramId,
        role: ADMIN_DATA.role,
        verified: true, // Админ создается сразу верифицированным
      },
    });

    console.log('✅ Администратор успешно создан!\n');
    console.log('📋 Данные для входа:');
    console.log(`   ФИО: ${admin.fio}`);
    console.log(`   Пароль: ${ADMIN_DATA.password}`);
    console.log(`   Роль: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Верифицирован: ${admin.verified ? 'Да' : 'Нет'}`);
    console.log('\n⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createDefaultAdmin();
