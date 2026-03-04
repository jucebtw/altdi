# 📥 Перенос изменений с Git на сервер

## Полная инструкция по обновлению

### Вариант 1: Если на сервере уже есть Git репозиторий

```bash
# 1. Подключиться к серверу
ssh root@188.215.31.206
# или
ssh ваш-пользователь@188.215.31.206

# 2. Перейти в директорию проекта
cd /var/www/vitrina

# 3. Обновить код из Git
git pull origin cursor/-bc-9c08d9df-b8f4-418a-b5e8-6b2140f9095d-060f

# 4. Обновить Backend
cd backend
npm install --production
npx prisma generate
npx prisma db push
pm2 restart vitrina-backend

# 5. Обновить Frontend
cd ../frontend
npm install
npm run build

# 6. Перезагрузить Nginx
sudo systemctl reload nginx

# 7. Проверить статус
pm2 status
pm2 logs vitrina-backend --lines 10
```

### Вариант 2: Если Git не настроен на сервере (первая настройка)

```bash
# 1. Подключиться к серверу
ssh root@188.215.31.206

# 2. Установить Git (если не установлен)
sudo apt update
sudo apt install -y git

# 3. Перейти в директорию
cd /var/www

# 4. Клонировать репозиторий (если еще не клонирован)
git clone https://github.com/jucebtw/altdi.git
cd altdi
git checkout cursor/-bc-9c08d9df-b8f4-418a-b5e8-6b2140f9095d-060f

# 5. Скопировать файлы в рабочую директорию
cp -r vitrina /var/www/vitrina

# 6. Настроить .env файлы
cd /var/www/vitrina/backend
cp .env.example .env
nano .env  # Отредактировать

cd ../frontend
echo "VITE_API_URL=/api" > .env

# 7. Установить зависимости и запустить (см. Вариант 1, шаги 4-7)
```

### Вариант 3: Обновление через rsync (с локального компьютера)

```bash
# С вашего локального компьютера
rsync -avz --exclude 'node_modules' --exclude '.git' \
  vitrina/ root@188.215.31.206:/var/www/vitrina/

# Затем на сервере:
ssh root@188.215.31.206
cd /var/www/vitrina/backend
npm install --production
npx prisma generate
pm2 restart vitrina-backend

cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

## Пошаговая инструкция (рекомендуется)

### Шаг 1: Подключение к серверу

```bash
ssh root@188.215.31.206
```

### Шаг 2: Обновление Backend

```bash
cd /var/www/vitrina/backend

# Обновить код (если Git настроен)
# git pull

# Или обновить файлы вручную

# Установить зависимости (если нужно)
npm install --production

# Обновить Prisma
npx prisma generate
npx prisma db push

# Перезапустить backend
pm2 restart vitrina-backend

# Проверить логи
pm2 logs vitrina-backend --lines 20
```

### Шаг 3: Обновление Frontend

```bash
cd /var/www/vitrina/frontend

# Обновить код (если Git настроен)
# git pull

# Убедиться, что .env настроен
echo "VITE_API_URL=/api" > .env

# Установить зависимости (если нужно)
npm install

# Пересобрать frontend
npm run build

# Проверить сборку
ls -la dist/index.html
```

### Шаг 4: Перезагрузка Nginx

```bash
sudo systemctl reload nginx
```

### Шаг 5: Проверка

```bash
# Проверить статус backend
pm2 status

# Проверить логи
pm2 logs vitrina-backend --lines 10

# Проверить Nginx
sudo systemctl status nginx

# Проверить сайт
curl -I https://altdi.ru
```

## Быстрый скрипт для обновления

Создайте на сервере файл `/var/www/vitrina/update-from-git.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Обновление проекта из Git..."

cd /var/www/vitrina

# Обновить код
if [ -d ".git" ]; then
  git pull
else
  echo "⚠️  Git не настроен, обновите файлы вручную"
fi

# Backend
echo "📦 Обновление backend..."
cd backend
npm install --production
npx prisma generate
npx prisma db push
pm2 restart vitrina-backend

# Frontend
echo "🎨 Обновление frontend..."
cd ../frontend
npm install
npm run build

# Nginx
echo "🌐 Перезагрузка Nginx..."
systemctl reload nginx

echo "✅ Обновление завершено!"
pm2 status
```

Сделать исполняемым:
```bash
chmod +x /var/www/vitrina/update-from-git.sh
```

Использовать:
```bash
sudo /var/www/vitrina/update-from-git.sh
```

## Важные файлы для проверки после обновления

### Backend .env
```bash
cd /var/www/vitrina/backend
cat .env | grep -E "TG_BOT_TOKEN|JWT_SECRET|DOMAIN|FRONTEND_URL"
```

Должно быть:
- `TG_BOT_TOKEN="8758089130:AAG28a56mhd_lSmOC3ePTlkG4mjotFHBqqU"`
- `DOMAIN="altdi.ru"`
- `FRONTEND_URL="https://altdi.ru"`

### Frontend .env
```bash
cd /var/www/vitrina/frontend
cat .env
```

Должно быть:
- `VITE_API_URL=/api`

## Решение проблем

### Ошибка: "fatal: not a git repository"

Git не настроен. Используйте Вариант 2 или обновляйте файлы вручную.

### Ошибка при npm install

```bash
# Очистить кеш
npm cache clean --force

# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install
```

### Ошибка при сборке frontend

```bash
cd /var/www/vitrina/frontend
rm -rf node_modules dist
npm install
npm run build
```

### Backend не запускается

```bash
# Проверить логи
pm2 logs vitrina-backend --err --lines 50

# Проверить .env
cd /var/www/vitrina/backend
cat .env

# Перезапустить
pm2 restart vitrina-backend
```

## Проверка изменений

После обновления проверьте:

1. **Сайт открывается**: `https://altdi.ru`
2. **Кнопка "Добавить товар" видна** (если залогинены)
3. **Инструкция о боте видна** на странице регистрации
4. **API работает**: `curl https://altdi.ru/api/health`

## Готово! 🎉

После выполнения всех шагов изменения будут на сервере.
