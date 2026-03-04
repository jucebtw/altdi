# 🔍 Диагностика ошибки 500 при регистрации

## Проверка на сервере

### 1. Проверить логи backend

```bash
pm2 logs vitrina-backend --lines 50
```

Ищите ошибки типа:
- "Ошибка регистрации"
- "Prisma error"
- "Telegram error"
- Stack trace

### 2. Проверить статус backend

```bash
pm2 status
pm2 logs vitrina-backend --err
```

### 3. Проверить базу данных

```bash
cd /var/www/vitrina/backend
npx prisma studio
# Откроется веб-интерфейс для просмотра БД
```

### 4. Проверить .env файл

```bash
cd /var/www/vitrina/backend
cat .env | grep -v SECRET
```

Убедитесь, что указаны:
- `TG_BOT_TOKEN`
- `JWT_SECRET`
- `DATABASE_URL`

### 5. Проверить API напрямую

```bash
curl -X POST https://altdi.ru/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fio":"Test User","password":"test123","telegram_username":"testuser"}' \
  -v
```

## Возможные причины

### 1. Проблема с Telegram ботом

Если в логах видно ошибку Telegram:
- Проверьте токен бота в `.env`
- Убедитесь, что бот запущен
- Проверьте, что пользователь написал боту `/start`

**Временное решение:** Можно сделать регистрацию без обязательной верификации Telegram (для теста).

### 2. Проблема с базой данных

Если ошибка Prisma:
```bash
cd /var/www/vitrina/backend
npx prisma generate
npx prisma db push
```

### 3. Проблема с переменными окружения

Проверьте, что все переменные указаны:
```bash
cd /var/www/vitrina/backend
cat .env
```

### 4. Проблема с CORS

Проверьте `FRONTEND_URL` в `.env`:
```env
FRONTEND_URL="https://altdi.ru"
```

## Временное решение: Регистрация без Telegram

Если проблема в Telegram боте, можно временно отключить обязательную верификацию.
