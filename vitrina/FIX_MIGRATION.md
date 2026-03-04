# 🔧 Исправление проблемы с миграциями Prisma

## Проблема
База данных существует, но нет миграций, или миграция создана, но не применена.

## Решение 1: Использовать db push (самый простой)

```bash
cd /var/www/vitrina/backend
npx prisma db push --accept-data-loss
```

Это синхронизирует схему БД с `schema.prisma` без миграций.

## Решение 2: Применить созданную миграцию

Если миграция уже создана (например, `20260304031055_baseline`):

```bash
cd /var/www/vitrina/backend

# Применить миграцию
npx prisma migrate deploy

# Или если это dev окружение
npx prisma migrate dev
```

## Решение 3: Создать baseline вручную

```bash
cd /var/www/vitrina/backend

# 1. Удалить существующие миграции (если есть)
rm -rf prisma/migrations

# 2. Создать baseline миграцию
npx prisma migrate dev --name init

# 3. Если БД уже существует и была сброшена, просто применить
npx prisma migrate deploy
```

## Решение 4: Начать с чистой БД (если данные не важны)

```bash
cd /var/www/vitrina/backend

# Удалить БД
rm database.sqlite

# Создать новую миграцию
npx prisma migrate dev --name init

# Или использовать db push
npx prisma db push
```

## После исправления

```bash
# Перезапустить backend
pm2 start src/app.js --name vitrina-backend
pm2 save

# Проверить статус
pm2 status
pm2 logs vitrina-backend
```
