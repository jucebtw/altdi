# 🏔️ Витрина мастеров Алтая

Платформа для размещения и продвижения товаров ручной работы от мастеров Алтайского края.

## 📋 Технологии

### Backend
- **Node.js** + **Express** - серверная часть
- **Prisma ORM** + **SQLite** - база данных
- **Telegraf** - Telegram бот для верификации
- **YooKassa SDK** - платежная система
- **JWT** - аутентификация
- **Multer** - загрузка файлов

### Frontend
- **React** + **Vite** - клиентская часть
- **React Router** - маршрутизация
- **React Bootstrap** - UI компоненты
- **Axios** - HTTP клиент

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- npm или yarn
- SQLite

### Установка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd vitrina
```

2. **Backend**
```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env файл, добавьте токены
npx prisma generate
npx prisma migrate dev
npm start
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Telegram бот**
- Создайте бота через @BotFather
- Получите токен и добавьте в `.env` файл backend
- Настройте бота для отправки сообщений пользователям

## 📁 Структура проекта

```
vitrina/
├── backend/                  # Node.js backend
│   ├── prisma/
│   │   └── schema.prisma    # Схема БД
│   ├── src/
│   │   ├── controllers/     # Контроллеры
│   │   ├── routes/          # Маршруты
│   │   ├── services/        # Сервисы (TG бот, платежи)
│   │   ├── middleware/      # Middleware (auth)
│   │   ├── app.js           # Главный файл приложения
│   │   └── config.js        # Конфигурация
│   ├── uploads/             # Загруженные изображения
│   └── .env                 # Переменные окружения
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/           # Страницы
│   │   ├── utils/           # Утилиты (API, Auth)
│   │   └── assets/          # CSS, изображения
│   └── vite.config.js
└── deploy.sh                # Скрипт деплоя
```

## 🔐 Роли пользователей

- **User** - обычный пользователь, может просматривать каталог
- **Master** - мастер, может создавать и редактировать свои товары
- **Admin** - администратор, полный доступ ко всем функциям

## 📡 API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/verify` - Верификация через Telegram
- `POST /api/auth/login` - Вход

### Каталог
- `GET /api/catalog/products` - Список товаров (с фильтрами)
- `GET /api/catalog/products/:id` - Детали товара
- `GET /api/catalog/categories` - Список категорий
- `GET /api/catalog/materials` - Список материалов

### Мастер
- `GET /api/master/products` - Мои товары
- `POST /api/master/products` - Создать товар
- `PUT /api/master/products/:id` - Обновить товар
- `DELETE /api/master/products/:id` - Удалить товар

### Админ
- `GET /api/admin/products` - Все товары
- `GET /api/admin/users` - Все пользователи
- `PUT /api/admin/products/:id` - Обновить товар
- `DELETE /api/admin/users/:id` - Удалить пользователя

### Платежи
- `POST /api/payment/create` - Создать платеж
- `POST /api/payment/webhook` - Webhook от YooKassa
- `GET /api/payment/levels` - Уровни продвижения

## 💳 Платежи и продвижение

Система поддерживает платное продвижение товаров через YooKassa:

- **Уровень 1** (1000₽): +5 к priority, +1 к size
- **Уровень 2** (2000₽): +10 к priority, +2 к size
- **Уровень 3** (3000₽): +15 к priority, +3 к size

## 🎨 Дизайн

Дизайн выполнен в этническом алтайском стиле:
- Цветовая палитра: темно-зеленый (кедр), коричневый (дерево), голубой (небо/горы)
- Динамический размер карточек товаров на основе `sizeBoost`
- Сортировка по `priorityLevel` для топовых товаров

## 🚢 Деплой

Используйте скрипт `deploy.sh` для автоматического деплоя на Ubuntu сервер:

```bash
sudo ./deploy.sh
```

Скрипт установит:
- Node.js 20+
- PM2 для управления процессами
- Nginx для проксирования и статики
- Настроит все необходимые конфигурации

### Ручной деплой

1. **Backend:**
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 start src/app.js --name vitrina-backend
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run build
# Скопировать dist в /var/www/vitrina/frontend/
```

3. **Nginx:**
Настройте конфигурацию как в `deploy.sh`

## 🔧 Переменные окружения

### Backend (.env)
```
DATABASE_URL="file:./database.sqlite"
JWT_SECRET="your-secret-key"
PORT=3000
TG_BOT_TOKEN="your-telegram-bot-token"
DOMAIN="altdi.ru"
YOOKASSA_SHOP_ID="your-shop-id"
YOOKASSA_SECRET_KEY="your-secret-key"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 📝 Лицензия

ISC

## 👥 Автор

Создано для витрины мастеров Алтая
