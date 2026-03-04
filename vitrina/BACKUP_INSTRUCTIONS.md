# Инструкция по созданию резервной копии

## Автоматическое создание бэкапа

Выполните на сервере:

```bash
cd /var/www/vitrina
bash backup.sh
```

Или скопируйте скрипт на сервер и запустите:

```bash
# Скопировать скрипт на сервер
scp vitrina/backup.sh root@188.215.31.206:/var/www/vitrina/

# На сервере
cd /var/www/vitrina
bash backup.sh
```

## Что сохраняется в бэкапе

1. **База данных SQLite** (`database.sqlite`)
2. **Исходный код backend** (`backend/src/`, `backend/prisma/`, `package.json`, `.env`)
3. **Исходный код frontend** (`frontend/src/`, `frontend/public/`, `package.json`, `.env`)
4. **Загруженные изображения** (`backend/uploads/`)
5. **Конфигурация Nginx** (`/etc/nginx/sites-available/vitrina`)
6. **Конфигурация PM2** (`~/.pm2/dump.pm2`)

## Где хранятся бэкапы

Бэкапы сохраняются в `/root/vitrina-backups/` в формате:
- `vitrina-backup-YYYYMMDD_HHMMSS.tar.gz`

Автоматически сохраняются последние 5 бэкапов, старые удаляются.

## Восстановление из бэкапа

```bash
# 1. Распаковать архив
cd /tmp
tar -xzf /root/vitrina-backups/vitrina-backup-YYYYMMDD_HHMMSS.tar.gz

# 2. Восстановить базу данных
cp vitrina-backup-*/database.sqlite /var/www/vitrina/backend/

# 3. Восстановить код (если нужно)
cp -r vitrina-backup-*/backend/src/* /var/www/vitrina/backend/src/
cp -r vitrina-backup-*/frontend/src/* /var/www/vitrina/frontend/src/

# 4. Восстановить изображения
cp -r vitrina-backup-*/uploads/* /var/www/vitrina/backend/uploads/

# 5. Восстановить конфигурацию Nginx
cp vitrina-backup-*/nginx/vitrina.conf /etc/nginx/sites-available/vitrina
nginx -t && systemctl reload nginx

# 6. Пересобрать frontend (если код изменился)
cd /var/www/vitrina/frontend
npm install
npm run build

# 7. Перезапустить backend
cd /var/www/vitrina/backend
npm install
npx prisma generate
pm2 restart vitrina-backend
```

## Ручное создание бэкапа

Если скрипт не работает, создайте бэкап вручную:

```bash
# Создать директорию
mkdir -p /root/vitrina-backups
cd /root/vitrina-backups

# Создать архив
tar -czf vitrina-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  /var/www/vitrina/backend/database.sqlite \
  /var/www/vitrina/backend/src \
  /var/www/vitrina/backend/prisma \
  /var/www/vitrina/backend/uploads \
  /var/www/vitrina/frontend/src \
  /etc/nginx/sites-available/vitrina
```

## Скачать бэкап на локальный компьютер

```bash
# С сервера
scp root@188.215.31.206:/root/vitrina-backups/vitrina-backup-*.tar.gz ./
```
