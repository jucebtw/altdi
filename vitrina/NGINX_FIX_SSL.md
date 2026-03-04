# 🔧 Исправление ошибки Nginx: invalid parameter "ss1"

## Проблема

В конфигурации Nginx опечатка: `ss1` вместо `ssl`.

## Быстрое исправление

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Найдите строку с `ss1` и замените на `ssl`:

**Было:**
```nginx
listen 443 ss1 http2;
```

**Должно быть:**
```nginx
listen 443 ssl http2;
```

Или если SSL еще не настроен, используйте:

```nginx
listen 80;
# listen 443 ssl http2;  # Раскомментируйте после настройки SSL
```

## Полная правильная конфигурация

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Вставьте:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    # Если SSL настроен, раскомментируйте:
    # listen 443 ssl http2;
    # ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;

    root /var/www/vitrina/frontend/dist;
    index index.html;

    # Frontend
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

## После исправления

```bash
# Проверить конфигурацию
sudo nginx -t

# Если ошибок нет, перезагрузить
sudo systemctl reload nginx

# Проверить
curl -I http://localhost
# Должно вернуть HTTP 200
```

## Быстрое исправление одной командой

```bash
sudo sed -i 's/ss1/ssl/g' /etc/nginx/sites-available/vitrina && \
sudo nginx -t && \
sudo systemctl reload nginx
```
