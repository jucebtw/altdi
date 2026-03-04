# ⚡ Быстрый старт

## За 5 минут до запуска

### 1. Установка зависимостей
```bash
# Backend
cd vitrina/backend
npm install

# Frontend (в другом терминале)
cd vitrina/frontend
npm install
```

### 2. Настройка .env

**Backend** (`vitrina/backend/.env`):
```
DATABASE_URL="file:./database.sqlite"
JWT_SECRET="change-this-to-random-secret-key-min-32-chars"
PORT=3000
TG_BOT_TOKEN="8758089130:AAG28a56mhd_lSmOC3ePTlkG4mjotFHBqqU"
DOMAIN="altdi.ru"
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
```

**Frontend** (`vitrina/frontend/.env`):
```
VITE_API_URL=http://localhost:3000/api
```

### 3. Инициализация БД
```bash
cd vitrina/backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Создание админа
```bash
cd vitrina/backend
npm run create-admin
```

### 5. Запуск

**Терминал 1 (Backend):**
```bash
cd vitrina/backend
npm run dev
```

**Терминал 2 (Frontend):**
```bash
cd vitrina/frontend
npm run dev
```

### 6. Открыть в браузере
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/health

## ⚠️ Важно перед регистрацией

Пользователи должны сначала написать Telegram боту `/start` перед регистрацией на сайте, чтобы бот сохранил их chat_id для отправки кодов верификации.

## 📝 Следующие шаги

1. Настройте Telegram бота (токен уже в .env)
2. Настройте YooKassa для платежей (опционально)
3. Загрузите изображения для дизайна (опционально)
4. Настройте домен и SSL для продакшена

Подробнее см. `SETUP.md` и `README.md`
