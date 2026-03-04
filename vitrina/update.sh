#!/bin/bash

# Скрипт для обновления приложения на сервере
# Использование: sudo ./update.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then 
  echo "Пожалуйста, запустите скрипт с правами root (sudo ./update.sh)"
  exit 1
fi

echo -e "${YELLOW}🔄 Обновление приложения...${NC}"

cd /var/www/vitrina

# Обновление через Git (если используется)
if [ -d ".git" ]; then
  echo -e "${YELLOW}Обновление кода из Git...${NC}"
  git pull
fi

# Backend обновление
echo -e "${YELLOW}Обновление backend...${NC}"
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 restart vitrina-backend

# Frontend обновление
echo -e "${YELLOW}Обновление frontend...${NC}"
cd ../frontend
npm install
npm run build

# Перезагрузка Nginx
echo -e "${YELLOW}Перезагрузка Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo -e "${GREEN}Проверьте статус: pm2 status${NC}"
