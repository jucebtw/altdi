#!/bin/bash
# Скрипт для создания бэкапа на сервере
# Запускать на сервере: bash CREATE_BACKUP_SERVER.sh

set -e

BACKUP_DIR="/root/vitrina-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="vitrina-backup-${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "🔄 Создание резервной копии проекта на сервере..."

# Создать директорию для бэкапов
mkdir -p "${BACKUP_DIR}"

# Создать директорию для текущего бэкапа
mkdir -p "${BACKUP_PATH}"

# 1. Бэкап базы данных SQLite
echo "📦 Копирование базы данных..."
if [ -f "/var/www/vitrina/backend/database.sqlite" ]; then
  cp /var/www/vitrina/backend/database.sqlite "${BACKUP_PATH}/database.sqlite"
  echo "✅ База данных скопирована"
else
  echo "⚠️  База данных не найдена"
fi

# 2. Бэкап исходного кода backend
echo "📦 Копирование backend..."
mkdir -p "${BACKUP_PATH}/backend"
cp -r /var/www/vitrina/backend/src "${BACKUP_PATH}/backend/" 2>/dev/null || true
cp -r /var/www/vitrina/backend/prisma "${BACKUP_PATH}/backend/" 2>/dev/null || true
cp /var/www/vitrina/backend/package.json "${BACKUP_PATH}/backend/" 2>/dev/null || true
cp /var/www/vitrina/backend/.env "${BACKUP_PATH}/backend/" 2>/dev/null || true
echo "✅ Backend скопирован"

# 3. Бэкап исходного кода frontend
echo "📦 Копирование frontend..."
mkdir -p "${BACKUP_PATH}/frontend"
cp -r /var/www/vitrina/frontend/src "${BACKUP_PATH}/frontend/" 2>/dev/null || true
cp -r /var/www/vitrina/frontend/public "${BACKUP_PATH}/frontend/" 2>/dev/null || true
cp /var/www/vitrina/frontend/package.json "${BACKUP_PATH}/frontend/" 2>/dev/null || true
cp /var/www/vitrina/frontend/vite.config.js "${BACKUP_PATH}/frontend/" 2>/dev/null || true
cp /var/www/vitrina/frontend/.env "${BACKUP_PATH}/frontend/" 2>/dev/null || true
echo "✅ Frontend скопирован"

# 4. Бэкап загруженных изображений
echo "📦 Копирование изображений..."
if [ -d "/var/www/vitrina/backend/uploads" ]; then
  mkdir -p "${BACKUP_PATH}/uploads"
  cp -r /var/www/vitrina/backend/uploads/* "${BACKUP_PATH}/uploads/" 2>/dev/null || true
  echo "✅ Изображения скопированы"
else
  echo "⚠️  Директория uploads не найдена"
fi

# 5. Бэкап конфигурации Nginx
echo "📦 Копирование конфигурации Nginx..."
mkdir -p "${BACKUP_PATH}/nginx"
cp /etc/nginx/sites-available/vitrina "${BACKUP_PATH}/nginx/vitrina.conf" 2>/dev/null || true
cp /etc/nginx/sites-available/default "${BACKUP_PATH}/nginx/default.conf" 2>/dev/null || true
echo "✅ Конфигурация Nginx скопирована"

# 6. Бэкап конфигурации PM2
echo "📦 Копирование конфигурации PM2..."
mkdir -p "${BACKUP_PATH}/pm2"
pm2 save 2>/dev/null || true
cp /root/.pm2/dump.pm2 "${BACKUP_PATH}/pm2/dump.pm2" 2>/dev/null || true
echo "✅ Конфигурация PM2 скопирована"

# 7. Создать архив
echo "📦 Создание архива..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"
echo "✅ Архив создан: ${BACKUP_NAME}.tar.gz"

# 8. Показать размер и информацию
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
echo ""
echo "✅ Резервная копия создана успешно!"
echo "📁 Путь: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "📊 Размер: ${BACKUP_SIZE}"
echo ""
echo "Для скачивания на локальный компьютер:"
echo "  scp root@188.215.31.206:${BACKUP_DIR}/${BACKUP_NAME}.tar.gz ./"

# 9. Удалить старые бэкапы (оставить последние 5)
echo "🧹 Очистка старых бэкапов..."
cd "${BACKUP_DIR}"
ls -t vitrina-backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
echo "✅ Старые бэкапы удалены (оставлено последних 5)"

echo ""
echo "🎉 Готово!"
