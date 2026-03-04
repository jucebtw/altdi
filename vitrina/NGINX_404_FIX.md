# 🔧 Исправление 404 ошибки в Nginx

## Проблема: Nginx возвращает 404

Backend работает, но Nginx не может найти frontend файлы.

## Решение

### 1. Проверить конфигурацию Nginx

```bash
sudo cat /etc/nginx/sites-available/vitrina
```

### 2. Проверить, что frontend собран

```bash
ls -la /var/www/vitrina/frontend/dist/
```

Должны быть файлы:
- `index.html`
- `assets/` (директория)

### 3. Исправить конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Должна быть такая конфигурация:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    # SSL сертификаты (если настроены)
    # ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;

    root /var/www/vitrina/frontend/dist;
    index index.html;

    # Frontend - все запросы на index.html
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
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
```

### 4. Проверить права доступа

```bash
# Проверить права на dist
ls -la /var/www/vitrina/frontend/dist/

# Исправить права если нужно
sudo chown -R www-data:www-data /var/www/vitrina/frontend/dist
sudo chmod -R 755 /var/www/vitrina/frontend/dist
```

### 5. Проверить и перезагрузить Nginx

```bash
# Проверить конфигурацию
sudo nginx -t

# Если ошибок нет, перезагрузить
sudo systemctl reload nginx

# Проверить логи
sudo tail -f /var/log/nginx/error.log
```

### 6. Проверить работу

```bash
# Проверить локально
curl -I http://localhost

# Должно вернуть HTTP 200, а не 404
```

## Быстрое исправление

```bash
# 1. Проверить frontend
ls -la /var/www/vitrina/frontend/dist/index.html

# 2. Если нет - собрать
cd /var/www/vitrina/frontend
npm run build

# 3. Проверить конфигурацию Nginx
sudo nginx -t

# 4. Исправить права
sudo chown -R www-data:www-data /var/www/vitrina/frontend/dist

# 5. Перезагрузить
sudo systemctl reload nginx

# 6. Проверить
curl -I http://localhost
```
