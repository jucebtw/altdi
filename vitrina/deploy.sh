#!/bin/bash

# Скрипт деплоя для Ubuntu сервера
# Использование: ./deploy.sh

set -e

echo "🚀 Начало деплоя Vitrina..."

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
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
  echo -e "${YELLOW}Установка Node.js 20...${NC}"
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
mkdir -p /var/www/vitrina/uploads
mkdir -p /var/www/vitrina/backend
mkdir -p /var/www/vitrina/frontend

# Копирование файлов (предполагается, что проект уже скопирован)
# В реальном сценарии используйте rsync или git clone

echo -e "${YELLOW}Настройка backend...${NC}"
cd /var/www/vitrina/backend

# Установка зависимостей
if [ -f "package.json" ]; then
  npm install --production
  npx prisma generate
  npx prisma migrate deploy
fi

# Настройка frontend
echo -e "${YELLOW}Настройка frontend...${NC}"
cd /var/www/vitrina/frontend

if [ -f "package.json" ]; then
  npm install
  npm run build
fi

# Создание конфига Nginx
echo -e "${YELLOW}Создание конфига Nginx...${NC}"
cat > /etc/nginx/sites-available/vitrina << 'EOF'
server {
    listen 80;
    server_name altdi.ru www.altdi.ru;

    root /var/www/vitrina/frontend/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/vitrina/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/vitrina /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфига Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx

# Запуск backend через PM2
echo -e "${YELLOW}Запуск backend через PM2...${NC}"
cd /var/www/vitrina/backend

if [ -f "src/app.js" ]; then
  pm2 delete vitrina-backend 2>/dev/null || true
  pm2 start src/app.js --name vitrina-backend
  pm2 save
  pm2 startup
fi

# Установка прав
chown -R www-data:www-data /var/www/vitrina
chmod -R 755 /var/www/vitrina
chmod -R 755 /var/www/vitrina/uploads

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo ""
echo "Проверьте:"
echo "  - PM2: pm2 status"
echo "  - Nginx: systemctl status nginx"
echo "  - Логи: pm2 logs vitrina-backend"
echo ""
echo "Для SSL сертификата (Let's Encrypt):"
echo "  apt-get install certbot python3-certbot-nginx"
echo "  certbot --nginx -d altdi.ru -d www.altdi.ru"
