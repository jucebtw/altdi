# 🚨 Восстановление сайта - пошаговая инструкция

## Быстрая диагностика

### 1. Проверить Backend (PM2)

```bash
pm2 status
```

**Если backend не запущен:**
```bash
cd /var/www/vitrina/backend
pm2 start src/app.js --name vitrina-backend
pm2 save
pm2 logs vitrina-backend --lines 20
```

### 2. Проверить Nginx

```bash
sudo systemctl status nginx
```

**Если Nginx не работает:**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo nginx -t
```

### 3. Проверить порты

```bash
sudo netstat -tulpn | grep -E "3000|80|443"
```

Должно быть:
- Порт 3000: backend (node)
- Порт 80: nginx
- Порт 443: nginx (если SSL настроен)

### 4. Проверить конфигурацию Nginx

```bash
sudo nginx -t
```

**Если есть ошибки - исправить:**
```bash
sudo nano /etc/nginx/sites-available/vitrina
```

## Полное восстановление

### Шаг 1: Запустить Backend

```bash
cd /var/www/vitrina/backend

# Проверить .env
cat .env | grep -E "PORT|JWT_SECRET|TG_BOT_TOKEN"

# Запустить через PM2
pm2 delete vitrina-backend 2>/dev/null || true
pm2 start src/app.js --name vitrina-backend
pm2 save

# Проверить логи
pm2 logs vitrina-backend --lines 30
```

### Шаг 2: Проверить Frontend

```bash
cd /var/www/vitrina/frontend

# Проверить, что frontend собран
ls -la dist/index.html

# Если нет - собрать
npm install
npm run build
```

### Шаг 3: Исправить конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

**Правильная конфигурация:**

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    root /var/www/vitrina/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/vitrina/uploads/;
    }
}
```

**Если SSL настроен, добавьте в начало блока server:**
```nginx
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;
include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

### Шаг 4: Проверить и перезапустить Nginx

```bash
# Проверить конфигурацию
sudo nginx -t

# Если ошибок нет
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Шаг 5: Проверить права доступа

```bash
sudo chown -R www-data:www-data /var/www/vitrina
sudo chmod -R 755 /var/www/vitrina
sudo chmod -R 775 /var/www/vitrina/uploads
```

### Шаг 6: Проверить работу

```bash
# Backend
curl http://localhost:3000/api/health
# Должно вернуть: {"status":"ok"}

# Frontend через Nginx
curl -I http://localhost
# Должно вернуть: HTTP/1.1 200 OK

# Через домен
curl -I https://altdi.ru
```

## Автоматический скрипт восстановления

Создайте файл `/var/www/vitrina/restore.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Восстановление сайта..."

# Backend
cd /var/www/vitrina/backend
pm2 restart vitrina-backend || pm2 start src/app.js --name vitrina-backend
pm2 save

# Frontend
cd /var/www/vitrina/frontend
if [ ! -f "dist/index.html" ]; then
  npm run build
fi

# Nginx
sudo nginx -t && sudo systemctl restart nginx

# Права
sudo chown -R www-data:www-data /var/www/vitrina
sudo chmod -R 755 /var/www/vitrina

echo "✅ Восстановление завершено!"
pm2 status
sudo systemctl status nginx --no-pager
```

Сделать исполняемым:
```bash
chmod +x /var/www/vitrina/restore.sh
```

Использовать:
```bash
sudo /var/www/vitrina/restore.sh
```

## Проверка всех компонентов

```bash
# 1. Backend
pm2 status
pm2 logs vitrina-backend --lines 10

# 2. Nginx
sudo systemctl status nginx
sudo nginx -t

# 3. Порты
sudo netstat -tulpn | grep -E "3000|80|443"

# 4. Frontend
ls -la /var/www/vitrina/frontend/dist/

# 5. Логи
sudo tail -f /var/log/nginx/error.log
pm2 logs vitrina-backend --err --lines 20
```

## Частые проблемы

### Backend не запускается
```bash
cd /var/www/vitrina/backend
pm2 logs vitrina-backend --err --lines 50
# Проверить ошибки и исправить
```

### Nginx возвращает 404
```bash
# Проверить путь к dist
ls -la /var/www/vitrina/frontend/dist/
# Если нет - собрать frontend
```

### Порт 3000 не слушает
```bash
# Проверить, запущен ли backend
pm2 status
# Если нет - запустить
pm2 start src/app.js --name vitrina-backend
```
