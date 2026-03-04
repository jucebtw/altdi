# Инструкция по установке и запуску

## Локальная разработка

### 1. Backend

```bash
cd backend
npm install
```

Создайте файл `.env` на основе `.env.example`:

```env
DATABASE_URL="file:./database.sqlite"
JWT_SECRET=your-secret-key-min-32-characters-long
TELEGRAM_BOT_TOKEN=8758089130:AAG28a56mhd_lSmOC3ePTlkG4mjotFHBqqU
DOMAIN=altdi.ru
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
PORT=3000
NODE_ENV=development
```

Инициализируйте базу данных:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Запустите сервер:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
```

Создайте файл `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Запустите dev сервер:

```bash
npm run dev
```

## Деплой на сервер

### Автоматический деплой

```bash
sudo ./deploy.sh
```

### Ручной деплой

1. Установите зависимости:
   ```bash
   # Backend
   cd /var/www/vitrina/backend
   npm install --production
   npx prisma generate
   npx prisma migrate deploy
   
   # Frontend
   cd /var/www/vitrina/frontend
   npm install
   npm run build
   ```

2. Настройте PM2:
   ```bash
   cd /var/www/vitrina/backend
   pm2 start src/app.js --name vitrina-backend
   pm2 save
   pm2 startup
   ```

3. Настройте Nginx (см. `deploy.sh`)

4. Настройте SSL (Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d altdi.ru -d www.altdi.ru
   ```

## Создание первого админа

После создания базы данных, создайте админа через Prisma Studio:

```bash
cd backend
npx prisma studio
```

Или через SQL:

```sql
UPDATE users SET role = 'Admin' WHERE id = 1;
```

## Проверка работы

1. Backend: http://localhost:3000/api/health
2. Frontend: http://localhost:5173
3. Prisma Studio: `npx prisma studio` (в папке backend)

## Проблемы и решения

### Ошибка "Yookassa не настроен"
Убедитесь, что в `.env` указаны `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`.

### Ошибка Telegram бота
Проверьте `TELEGRAM_BOT_TOKEN` в `.env`. Бот должен быть создан через @BotFather.

### Ошибка Prisma
Убедитесь, что выполнили:
```bash
npx prisma generate
npx prisma migrate dev
```

### Проблемы с загрузкой файлов
Проверьте права доступа к папке `uploads/`:
```bash
chmod -R 755 uploads/
```
