# 🚨 Быстрое восстановление сайта

## Проблемы обнаружены:

1. **Backend не запущен** - PM2 пустой
2. **Конфликты в Nginx** - дублирование server_name

## Исправление

### 1. Запустить Backend

```bash
cd /var/www/vitrina/backend
pm2 start src/app.js --name vitrina-backend
pm2 save
pm2 logs vitrina-backend --lines 10
```

### 2. Исправить конфликты в Nginx

Проблема: дублирование server блоков. Certbot создал дополнительные блоки.

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

**Удалите дублирующие блоки server.** Должен остаться только один основной блок:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

### 3. Проверить и перезапустить

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Проверить работу

```bash
# Backend
pm2 status
curl http://localhost:3000/api/health

# Frontend
curl -I http://localhost
curl -I https://altdi.ru
```
