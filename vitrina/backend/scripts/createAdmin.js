const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    console.log('Создание администратора...\n');

    const fio = await question('ФИО: ');
    const password = await question('Пароль: ');
    const telegramUsername = await question('Telegram username (без @): ');

    // Проверка существования
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { fio },
          { telegramId: telegramUsername },
        ],
      },
    });

    if (existing) {
      console.error('Пользователь уже существует!');
      process.exit(1);
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание администратора
    const admin = await prisma.user.create({
      data: {
        fio,
        passwordHash,
        telegramId: telegramUsername,
        role: 'Admin',
        verified: true, // Админ создается сразу верифицированным
      },
    });

    console.log('\n✅ Администратор успешно создан!');
    console.log(`ID: ${admin.id}`);
    console.log(`ФИО: ${admin.fio}`);
    console.log(`Роль: ${admin.role}`);

    rl.close();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Ошибка:', error);
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
