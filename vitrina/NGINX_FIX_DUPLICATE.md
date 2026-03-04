# 🔧 Исправление дублирования listen 443 в Nginx

## Проблема

В конфигурации Nginx есть дублирование `listen 443`:
- Строка 3: `listen 443 ssl http2;`
- Строка 33: `listen 443 ssl; # managed by Certbot`

## Решение

Нужно убрать дублирование. Certbot уже добавил правильные настройки SSL, поэтому нужно удалить первую строку.

### Исправление

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Удалите строку:
```nginx
listen 443 ssl http2;
```

Или замените весь первый блок server на:

```nginx
server {
    listen 443 ssl http2;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    root /var/www/vitrina/frontend/dist;
    index index.html;

    # SSL сертификаты (управляются Certbot)
    ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

server {
    if ($host = www.altdi.ru) {
        return 301 https://$host$request_uri;
    }

    if ($host = altdi.ru) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;
    return 404;
}
```

### Быстрое исправление одной командой

```bash
# Удалить дублирующую строку listen 443 ssl http2;
sudo sed -i '/listen 443 ssl http2;/d' /etc/nginx/sites-available/vitrina

# Проверить
sudo nginx -t

# Перезагрузить
sudo systemctl reload nginx
```
