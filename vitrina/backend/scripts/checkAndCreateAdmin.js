const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Данные администратора
const ADMIN_DATA = {
  fio: 'Администратор',
  password: 'Admin123!',
  telegramId: 'admin',
  role: 'Admin',
};

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Проверка администратора...\n');

    // Ищем всех админов
    const admins = await prisma.user.findMany({
      where: { role: 'Admin' },
    });

    console.log(`Найдено администраторов: ${admins.length}\n`);

    if (admins.length > 0) {
      console.log('Существующие администраторы:');
      for (const admin of admins) {
        console.log(`  - ID: ${admin.id}, ФИО: "${admin.fio}", Верифицирован: ${admin.verified}`);
        
        // Проверяем пароль
        const testPassword = await bcrypt.compare(ADMIN_DATA.password, admin.passwordHash);
        console.log(`    Пароль "Admin123!" ${testPassword ? '✅ совпадает' : '❌ не совпадает'}`);
      }
    }

    // Ищем админа с нужным ФИО
    const existing = await prisma.user.findFirst({
      where: { fio: ADMIN_DATA.fio },
    });

    if (existing) {
      console.log(`\n✅ Найден пользователь с ФИО "${ADMIN_DATA.fio}":`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Роль: ${existing.role}`);
      console.log(`   Верифицирован: ${existing.verified}`);
      
      // Проверяем пароль
      const passwordMatch = await bcrypt.compare(ADMIN_DATA.password, existing.passwordHash);
      console.log(`   Пароль "Admin123!": ${passwordMatch ? '✅ совпадает' : '❌ не совпадает'}`);
      
      if (!passwordMatch || existing.role !== 'Admin' || !existing.verified) {
        console.log('\n🔄 Обновление данных администратора...');
        
        const passwordHash = await bcrypt.hash(ADMIN_DATA.password, 10);
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            role: 'Admin',
            verified: true,
          },
        });
        
        console.log('✅ Данные обновлены!');
      }
      
      await prisma.$disconnect();
      return;
    }

    // Создаем нового админа
    console.log('\n🆕 Создание нового администратора...');
    
    const passwordHash = await bcrypt.hash(ADMIN_DATA.password, 10);
    const admin = await prisma.user.create({
      data: {
        fio: ADMIN_DATA.fio,
        passwordHash,
        telegramId: ADMIN_DATA.telegramId,
        role: ADMIN_DATA.role,
        verified: true,
      },
    });

    console.log('\n✅ Администратор успешно создан!');
    console.log('\n📋 Данные для входа:');
    console.log(`   ФИО: "${admin.fio}"`);
    console.log(`   Пароль: "${ADMIN_DATA.password}"`);
    console.log(`   Роль: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Верифицирован: ${admin.verified ? 'Да' : 'Нет'}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndCreateAdmin();
