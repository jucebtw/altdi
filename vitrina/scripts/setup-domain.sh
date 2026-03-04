#!/bin/bash

# Скрипт для настройки домена altdi.ru
# Использование: sudo ./setup-domain.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then 
  echo "Пожалуйста, запустите скрипт с правами root (sudo ./setup-domain.sh)"
  exit 1
fi

DOMAIN="altdi.ru"
IP="188.215.31.206"

echo -e "${YELLOW}🌐 Настройка домена ${DOMAIN}...${NC}"

# Проверка DNS
echo -e "${YELLOW}Проверка DNS записей...${NC}"
DNS_IP=$(dig +short $DOMAIN | head -1)
if [ "$DNS_IP" != "$IP" ]; then
  echo -e "${YELLOW}⚠️  Внимание: DNS запись для $DOMAIN указывает на $DNS_IP, а не на $IP${NC}"
  echo -e "${YELLOW}Убедитесь, что в DNS настроена A запись: $DOMAIN -> $IP${NC}"
  read -p "Продолжить? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo -e "${GREEN}✅ DNS запись корректна: $DOMAIN -> $DNS_IP${NC}"
fi

# Обновление Nginx конфигурации
echo -e "${YELLOW}Обновление Nginx конфигурации...${NC}"
cat > /etc/nginx/sites-available/vitrina <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} ${IP};

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
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss application/json;
}
EOF

# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl reload nginx

echo -e "${GREEN}✅ Nginx обновлен${NC}"

# Установка Certbot (если не установлен)
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}Установка Certbot...${NC}"
  apt update
  apt install -y certbot python3-certbot-nginx
fi

# Получение SSL сертификата
echo -e "${YELLOW}Настройка SSL сертификата...${NC}"
echo -e "${YELLOW}Certbot запросит email для уведомлений${NC}"
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || {
  echo -e "${YELLOW}⚠️  Не удалось автоматически получить сертификат${NC}"
  echo -e "${YELLOW}Выполните вручную: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
}

# Обновление .env файлов
echo -e "${YELLOW}Обновление переменных окружения...${NC}"

# Backend .env
if [ -f "/var/www/vitrina/backend/.env" ]; then
  sed -i "s|DOMAIN=.*|DOMAIN=\"${DOMAIN}\"|g" /var/www/vitrina/backend/.env
  sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=\"https://${DOMAIN}\"|g" /var/www/vitrina/backend/.env
  echo -e "${GREEN}✅ Backend .env обновлен${NC}"
fi

# Frontend .env
if [ -f "/var/www/vitrina/frontend/.env" ]; then
  echo "VITE_API_URL=/api" > /var/www/vitrina/frontend/.env
  echo -e "${GREEN}✅ Frontend .env обновлен${NC}"
fi

# Перезапуск backend
echo -e "${YELLOW}Перезапуск backend...${NC}"
pm2 restart vitrina-backend || pm2 start /var/www/vitrina/backend/src/app.js --name vitrina-backend

echo -e "${GREEN}✅ Домен настроен!${NC}"
echo -e "${GREEN}Сайт доступен по адресу: https://${DOMAIN}${NC}"
echo -e "${YELLOW}Проверьте: curl -I https://${DOMAIN}${NC}"
