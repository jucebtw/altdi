# 🚀 Запуск Backend при ошибке Connection refused

## Проблема: Connection refused (111)

Backend не запущен или не слушает на порту 3000.

## Быстрое исправление

### 1. Проверить статус PM2

```bash
pm2 status
```

### 2. Запустить Backend

```bash
cd /var/www/vitrina/backend

# Запустить через PM2
pm2 start src/app.js --name vitrina-backend

# Сохранить конфигурацию
pm2 save

# Проверить логи
pm2 logs vitrina-backend --lines 20
```

### 3. Проверить, что backend слушает на порту 3000

```bash
sudo netstat -tulpn | grep 3000
```

Должно быть:
```
tcp  0.0.0.0:3000  LISTEN  node
```

### 4. Проверить доступность

```bash
curl http://localhost:3000/api/health
# Должно вернуть: {"status":"ok"}
```

## Если backend не запускается

### Проверить ошибки

```bash
cd /var/www/vitrina/backend
pm2 logs vitrina-backend --err --lines 50
```

### Проверить .env файл

```bash
cat .env | grep -E "PORT|JWT_SECRET|DATABASE_URL"
```

### Проверить Prisma

```bash
npx prisma generate
npx prisma db push
```

### Запустить вручную для проверки

```bash
cd /var/www/vitrina/backend
node src/app.js
```

Если есть ошибки - исправить их.

## Настройка автозапуска

```bash
# Сохранить текущие процессы
pm2 save

# Настроить автозапуск при перезагрузке
pm2 startup systemd
# Выполните команду, которую выведет PM2
```

## Проверка после запуска

```bash
# Статус
pm2 status

# Логи
pm2 logs vitrina-backend --lines 10

# Проверка API
curl http://localhost:3000/api/health

# Проверка через Nginx
curl https://altdi.ru/api/health
```
