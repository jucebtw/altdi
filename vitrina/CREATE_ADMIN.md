# Создание администратора

## Автоматическое создание админа с предустановленными данными

Выполните на сервере:

```bash
cd /var/www/vitrina/backend
npm run create-default-admin
```

**Данные для входа:**
- **ФИО:** Администратор
- **Пароль:** Admin123!
- **Роль:** Admin
- **Верифицирован:** Да (не требует Telegram верификации)

## Если админ уже существует

Если админ уже создан, скрипт покажет информацию о существующем админе.

Для обновления пароля:
```bash
npm run create-default-admin -- --update-password
```

## Ручное создание админа

Если нужно создать админа с другими данными:

```bash
cd /var/www/vitrina/backend
npm run create-admin
```

Скрипт запросит:
- ФИО
- Пароль
- Telegram username

## Права администратора

Администратор может:
- ✅ Просматривать все товары
- ✅ Редактировать любые товары (не только свои)
- ✅ Удалять любые товары (не только свои)
- ✅ Просматривать всех пользователей
- ✅ Удалять пользователей
- ✅ Доступ к админ-панели (`/admin`)

## Вход в систему

1. Перейдите на https://altdi.ru/login
2. Введите:
   - **ФИО:** Администратор
   - **Пароль:** Admin123!
3. После входа вы увидите ссылку "Админ-панель" в навбаре

## Изменение пароля админа

Если нужно изменить пароль, можно:

1. **Через скрипт (обновить существующего):**
   ```bash
   # Отредактировать скрипт и изменить ADMIN_DATA.password
   nano scripts/createDefaultAdmin.js
   # Затем запустить с флагом --update-password
   npm run create-default-admin -- --update-password
   ```

2. **Через базу данных:**
   ```bash
   cd /var/www/vitrina/backend
   node -e "
   const bcrypt = require('bcrypt');
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   (async () => {
     const newPassword = 'НовыйПароль123!';
     const hash = await bcrypt.hash(newPassword, 10);
     await prisma.user.updateMany({
       where: { role: 'Admin' },
       data: { passwordHash: hash }
     });
     console.log('Пароль обновлен!');
     await prisma.\$disconnect();
   })();
   "
   ```

## Безопасность

⚠️ **ВАЖНО:**
- Измените пароль по умолчанию после первого входа
- Не делитесь учетными данными администратора
- Используйте сложный пароль в продакшене
