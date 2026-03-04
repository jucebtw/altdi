#!/bin/bash

# Скрипт деплоя для Ubuntu сервера
# Использование: ./deploy.sh

set -e

echo "🚀 Начало деплоя витрины мастеров..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
  echo "Пожалуйста, запустите скрипт с правами root (sudo ./deploy.sh)"
  exit 1
fi

# Установка Node.js 20+
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Установка Node.js...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Установка PM2
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}Установка PM2...${NC}"
  npm install -g pm2
fi

# Установка Nginx
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}Установка Nginx...${NC}"
  apt-get update
  apt-get install -y nginx
fi

# Создание директорий
echo -e "${YELLOW}Создание директорий...${NC}"
mkdir -p /var/www/vitrina
mkdir -p /var/www/vitrina/backend
mkdir -p /var/www/vitrina/frontend
mkdir -p /var/www/vitrina/uploads

# Копирование файлов (предполагается, что файлы уже на сервере)
# В реальном деплое используйте rsync или git clone
# Если файлы уже скопированы, пропустите этот шаг

echo -e "${YELLOW}Настройка backend...${NC}"
cd /var/www/vitrina/backend

# Проверка наличия .env файла
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Создание .env из примера...${NC}"
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  ВАЖНО: Отредактируйте /var/www/vitrina/backend/.env перед запуском!${NC}"
  elif [ -f ".env.production.example" ]; then
    cp .env.production.example .env
    echo -e "${YELLOW}⚠️  ВАЖНО: Отредактируйте /var/www/vitrina/backend/.env перед запуском!${NC}"
  fi
fi

# Установка зависимостей
if [ -f "package.json" ]; then
  npm install --production
fi

# Настройка Prisma
if [ -f "prisma/schema.prisma" ]; then
  npx prisma generate
  
  # Проверка существования БД
  if [ -f "database.sqlite" ]; then
    # Если БД существует, используем db push (синхронизирует схему без миграций)
    echo -e "${YELLOW}База данных существует, синхронизация схемы...${NC}"
    npx prisma db push --accept-data-loss || true
  else
    # Если БД не существует, создаем миграцию
    echo -e "${YELLOW}Создание миграции...${NC}"
    npx prisma migrate dev --name init || npx prisma db push
  fi
fi

# Создание systemd service для PM2 (опционально)
# pm2 startup systemd -u $USER --hp /home/$USER

# Запуск backend через PM2
echo -e "${YELLOW}Запуск backend...${NC}"
pm2 delete vitrina-backend 2>/dev/null || true
pm2 start src/app.js --name vitrina-backend
pm2 save

echo -e "${YELLOW}Настройка frontend...${NC}"
cd /var/www/vitrina/frontend

# Создание .env для production
if [ ! -f ".env" ]; then
  echo "VITE_API_URL=https://altdi.ru/api" > .env
fi

# Установка зависимостей и сборка
if [ -f "package.json" ]; then
  npm install
  npm run build
fi

# Настройка Nginx
echo -e "${YELLOW}Настройка Nginx...${NC}"
cat > /etc/nginx/sites-available/vitrina <<EOF
server {
    listen 80;
    server_name altdi.ru www.altdi.ru;

    root /var/www/vitrina/frontend/dist;
    index index.html;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/vitrina/uploads/;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/vitrina /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

# Настройка прав доступа
chown -R www-data:www-data /var/www/vitrina
chmod -R 755 /var/www/vitrina
chmod -R 775 /var/www/vitrina/uploads

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo -e "${GREEN}Backend запущен на порту 3000 через PM2${NC}"
echo -e "${GREEN}Frontend доступен через Nginx на порту 80${NC}"
echo -e "${YELLOW}Не забудьте настроить SSL сертификат (Let's Encrypt) для HTTPS!${NC}"
