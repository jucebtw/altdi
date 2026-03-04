# Backend - Витрина мастеров

## Установка

```bash
npm install
cp .env.example .env
# Отредактируйте .env файл
npx prisma generate
npx prisma migrate dev
```

## Запуск

```bash
# Development
npm run dev

# Production
npm start
```

## Переменные окружения

См. `.env.example`

## Prisma

```bash
# Генерация клиента
npx prisma generate

# Миграции
npx prisma migrate dev

# Просмотр БД
npx prisma studio
```
