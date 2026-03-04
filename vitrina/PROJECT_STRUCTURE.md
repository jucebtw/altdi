# 📁 Структура проекта

## Backend (`/backend`)

```
backend/
├── prisma/
│   └── schema.prisma          # Схема базы данных (User, Product)
├── src/
│   ├── controllers/           # Контроллеры (бизнес-логика)
│   │   ├── authController.js   # Регистрация, верификация, вход
│   │   ├── productController.js # CRUD товаров для мастера
│   │   ├── catalogController.js # Каталог, фильтры, поиск
│   │   └── adminController.js  # Админские функции
│   ├── routes/                 # API маршруты
│   │   ├── authRoutes.js       # /api/auth/*
│   │   ├── catalogRoutes.js    # /api/catalog/*
│   │   ├── masterRoutes.js     # /api/master/*
│   │   ├── adminRoutes.js      # /api/admin/*
│   │   └── paymentRoutes.js    # /api/payment/*
│   ├── services/               # Внешние сервисы
│   │   ├── telegram.js         # Telegram бот для верификации
│   │   └── payment.js          # YooKassa интеграция
│   ├── middleware/             # Middleware
│   │   └── auth.js             # JWT аутентификация, проверка ролей
│   ├── app.js                  # Главный файл Express приложения
│   └── config.js               # Конфигурация (env переменные)
├── scripts/
│   └── createAdmin.js          # Скрипт создания первого админа
├── uploads/                    # Загруженные изображения товаров
├── .env                        # Переменные окружения (не в git)
├── .env.example                # Пример .env файла
└── package.json                # Зависимости и скрипты
```

## Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/             # React компоненты
│   │   └── Navbar.jsx          # Навигационная панель
│   ├── pages/                  # Страницы приложения
│   │   ├── Home.jsx            # Главная страница
│   │   ├── Catalog.jsx         # Каталог товаров (фильтры, поиск)
│   │   ├── Product.jsx         # Страница товара
│   │   ├── Login.jsx           # Вход
│   │   ├── Register.jsx        # Регистрация + верификация
│   │   ├── MasterDashboard.jsx # Кабинет мастера (CRUD товаров)
│   │   └── AdminDashboard.jsx  # Админ-панель
│   ├── utils/                  # Утилиты
│   │   ├── AuthContext.jsx     # React Context для аутентификации
│   │   └── api.js              # Axios конфигурация
│   ├── assets/                 # Статические файлы
│   │   └── style.css           # Кастомные стили (Алтай-тема)
│   ├── App.jsx                 # Главный компонент с роутингом
│   └── main.jsx                # Точка входа
├── public/                     # Публичные файлы
├── index.html                  # HTML шаблон
├── vite.config.js              # Конфигурация Vite
└── package.json                # Зависимости
```

## Корневые файлы

```
vitrina/
├── deploy.sh                   # Скрипт автоматического деплоя
├── README.md                   # Основная документация
├── SETUP.md                    # Инструкция по установке
├── PROJECT_STRUCTURE.md        # Этот файл
└── .gitignore                  # Игнорируемые файлы
```

## Основные функции

### 🔐 Аутентификация
- Регистрация с Telegram верификацией
- JWT токены для авторизации
- Роли: User, Master, Admin

### 🛍️ Каталог товаров
- Фильтры: цена, категория, материал
- Поиск по названию/описанию
- Сортировка: по популярности (priority), по цене
- Динамический размер карточек (sizeBoost)

### 👨‍🎨 Кабинет мастера
- Создание/редактирование/удаление товаров
- Загрузка множественных изображений
- Управление приоритетом и размером

### 👑 Админ-панель
- Управление всеми товарами
- Управление пользователями
- Полный контроль над системой

### 💳 Платежи
- Интеграция с YooKassa
- Платное продвижение товаров
- Webhook для обработки платежей

## База данных

SQLite с двумя основными таблицами:

- **users**: Пользователи (id, fio, password_hash, role, telegram_id, verified)
- **products**: Товары (id, master_id, title, description, price, images, category, material, priority_level, size_boost)

## API Endpoints

Все API endpoints начинаются с `/api`:

- `/api/auth/*` - Авторизация
- `/api/catalog/*` - Каталог (публичный)
- `/api/master/*` - Функции мастера (требует авторизации)
- `/api/admin/*` - Админские функции (требует роль Admin)
- `/api/payment/*` - Платежи
