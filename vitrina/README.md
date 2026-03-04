# Витрина Алтая

Платформа для мастеров Алтайского края по продаже изделий ручной работы.

## 🏗️ Структура проекта

```
vitrina/
├── backend/                  # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma    # Схема БД
│   ├── src/
│   │   ├── controllers/      # Контроллеры
│   │   ├── routes/          # Маршруты
│   │   ├── services/        # Telegram бот, платежи
│   │   ├── middleware/      # Auth middleware
│   │   ├── app.js           # Главный файл
│   │   └── config.js        # Конфигурация
│   ├── .env                 # Переменные окружения
│   └── package.json
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Компоненты
│   │   ├── pages/          # Страницы
│   │   ├── assets/         # CSS, изображения
│   │   ├── utils/          # API утилиты
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── uploads/                 # Загруженные изображения
├── deploy.sh               # Скрипт деплоя
└── README.md
```

## 🚀 Быстрый старт

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Настройка

### Backend (.env)

```env
DATABASE_URL="file:./database.sqlite"
JWT_SECRET=your-secret-key-min-32-chars
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
DOMAIN=altdi.ru
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
PORT=3000
NODE_ENV=development
```

### Frontend

Создайте `.env` файл:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📋 Функционал

### Пользователи
- **User**: Просмотр каталога
- **Master**: Управление своими товарами, продвижение
- **Admin**: Полный доступ к товарам и пользователям

### Авторизация
- Регистрация с верификацией через Telegram
- Вход по ФИО и паролю
- JWT токены для авторизации

### Каталог
- Фильтрация по цене, категории, материалу
- Сортировка по приоритету, цене
- Поиск по названию и описанию
- Динамический размер карточек (sizeBoost)

### Платежи
- Интеграция с Yookassa
- Продвижение товаров (увеличение приоритета и размера)

## 🗄️ База данных

SQLite с Prisma ORM. Таблицы:
- `users`: Пользователи (User/Master/Admin)
- `products`: Товары с приоритетом и размером

## 🎨 Дизайн

Алтайская тематика с кастомными стилями в `frontend/src/assets/style.css`.

## 📦 Деплой

Используйте скрипт `deploy.sh`:

```bash
sudo ./deploy.sh
```

Скрипт установит:
- Node.js 20+
- PM2 для управления процессами
- Nginx для проксирования
- Настроит автозапуск

## 🔧 Разработка

### Prisma команды

```bash
# Генерация клиента
npx prisma generate

# Миграции
npx prisma migrate dev

# Просмотр БД
npx prisma studio
```

### PM2 команды

```bash
# Запуск
pm2 start src/app.js --name vitrina-backend

# Статус
pm2 status

# Логи
pm2 logs vitrina-backend

# Перезапуск
pm2 restart vitrina-backend
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/verify` - Верификация
- `POST /api/auth/login` - Вход

### Catalog
- `GET /api/catalog/products` - Список товаров (с фильтрами)
- `GET /api/catalog/products/:id` - Детали товара

### Master
- `GET /api/master/products` - Мои товары
- `POST /api/master/products` - Создать товар
- `PUT /api/master/products/:id` - Обновить товар
- `DELETE /api/master/products/:id` - Удалить товар

### Admin
- `GET /api/admin/products` - Все товары
- `PUT /api/admin/products/:id` - Обновить товар
- `DELETE /api/admin/products/:id` - Удалить товар
- `GET /api/admin/users` - Все пользователи
- `DELETE /api/admin/users/:id` - Удалить пользователя

### Payment
- `POST /api/payment/create` - Создать платеж
- `POST /api/payment/webhook` - Webhook от Yookassa

## 🔒 Безопасность

- Helmet для заголовков безопасности
- Rate limiting для auth endpoints
- JWT токены
- Bcrypt для хеширования паролей
- Валидация через Zod

## 📄 Лицензия

ISC
