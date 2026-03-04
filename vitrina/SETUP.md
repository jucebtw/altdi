# 🚀 Инструкция по установке и запуску

## Предварительные требования

- Node.js 20 или выше
- npm или yarn
- Telegram бот (создать через @BotFather)
- YooKassa аккаунт (для платежей, опционально)

## Шаг 1: Установка зависимостей

### Backend
```bash
cd vitrina/backend
npm install
```

### Frontend
```bash
cd vitrina/frontend
npm install
```

## Шаг 2: Настройка переменных окружения

### Backend (.env)
```bash
cd vitrina/backend
cp .env.example .env
```

Отредактируйте `.env`:
```
DATABASE_URL="file:./database.sqlite"
JWT_SECRET="ваш-секретный-ключ-минимум-32-символа"
PORT=3000
TG_BOT_TOKEN="8758089130:AAG28a56mhd_lSmOC3ePTlkG4mjotFHBqqU"
DOMAIN="altdi.ru"
YOOKASSA_SHOP_ID="ваш-shop-id"
YOOKASSA_SECRET_KEY="ваш-secret-key"
```

### Frontend (.env)
```bash
cd vitrina/frontend
```

Создайте `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

## Шаг 3: Настройка базы данных

```bash
cd vitrina/backend
npx prisma generate
npx prisma migrate dev --name init
```

## Шаг 4: Создание первого администратора

```bash
cd vitrina/backend
npm run create-admin
```

Введите данные администратора при запросе.

## Шаг 5: Настройка Telegram бота

1. Создайте бота через @BotFather в Telegram
2. Получите токен и добавьте в `.env` файл backend
3. **Важно**: Пользователи должны сначала написать боту `/start` перед регистрацией на сайте
4. Бот сохранит их chat_id для последующей отправки кодов верификации

## Шаг 6: Запуск приложения

### Backend (терминал 1)
```bash
cd vitrina/backend
npm run dev
# или для production
npm start
```

Backend будет доступен на `http://localhost:3000`

### Frontend (терминал 2)
```bash
cd vitrina/frontend
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

## Шаг 7: Проверка работы

1. Откройте `http://localhost:5173`
2. Зарегистрируйтесь (не забудьте сначала написать боту `/start`)
3. Войдите в систему
4. Если вы администратор, перейдите в админ-панель

## Проблемы и решения

### Ошибка при отправке кода в Telegram
- Убедитесь, что пользователь написал боту `/start` перед регистрацией
- Проверьте правильность токена бота в `.env`

### Ошибки базы данных
- Убедитесь, что выполнили миграции: `npx prisma migrate dev`
- Проверьте права доступа к файлу `database.sqlite`

### Проблемы с загрузкой изображений
- Убедитесь, что папка `uploads` существует и доступна для записи
- Проверьте настройки multer в `backend/src/routes/masterRoutes.js`

## Деплой на сервер

Используйте скрипт `deploy.sh`:
```bash
sudo ./deploy.sh
```

Или следуйте инструкциям в `README.md`
