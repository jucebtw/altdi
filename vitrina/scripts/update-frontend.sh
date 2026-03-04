#!/bin/bash

# Скрипт для обновления frontend на сервере
# Использование: sudo ./update-frontend.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Обновление frontend...${NC}"

cd /var/www/vitrina/frontend

# Обновление кода (если используется Git)
if [ -d ".git" ]; then
  echo -e "${YELLOW}Обновление кода из Git...${NC}"
  git pull
fi

# Убедиться, что .env настроен
echo "VITE_API_URL=/api" > .env
echo -e "${GREEN}✅ .env настроен${NC}"

# Установка зависимостей (если нужно)
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Установка зависимостей...${NC}"
  npm install
fi

# Пересборка
echo -e "${YELLOW}Пересборка frontend...${NC}"
npm run build

# Проверка сборки
if [ -f "dist/index.html" ]; then
  echo -e "${GREEN}✅ Frontend успешно собран${NC}"
  echo -e "${GREEN}Файл: $(ls -lh dist/index.html | awk '{print $9, $5, $6, $7, $8}')${NC}"
else
  echo -e "${YELLOW}⚠️  Предупреждение: dist/index.html не найден${NC}"
fi

# Перезагрузка Nginx
echo -e "${YELLOW}Перезагрузка Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✅ Frontend обновлен!${NC}"
echo -e "${YELLOW}Не забудьте очистить кеш браузера (Ctrl+Shift+Delete)${NC}"
