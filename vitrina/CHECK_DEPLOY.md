# 🔍 Проверка деплоя и диагностика проблем

## Проблема: "Cannot GET /" на порту 3000

Это нормально! Порт 3000 - это **backend API**, а не веб-сайт. 

## Где должен быть доступен сайт

- **Frontend (веб-сайт)**: `http://188.215.31.206` (порт 80) или `https://altdi.ru`
- **Backend API**: `http://188.215.31.206:3000/api/health` (для проверки)

## Проверка деплоя

### 1. Проверка Backend (PM2)

```bash
# Проверить статус
pm2 status

# Должен быть процесс vitrina-backend
# Если нет - запустить:
cd /var/www/vitrina/backend
pm2 start src/app.js --name vitrina-backend
pm2 save

# Проверить логи
pm2 logs vitrina-backend
```

### 2. Проверка Frontend

```bash
# Проверить, собран ли frontend
ls -la /var/www/vitrina/frontend/dist/

# Должны быть файлы: index.html, assets/ и т.д.

# Если нет - собрать:
cd /var/www/vitrina/frontend
npm install
npm run build
```

### 3. Проверка Nginx

```bash
# Проверить статус
systemctl status nginx

# Проверить конфигурацию
nginx -t

# Проверить, активен ли сайт
ls -la /etc/nginx/sites-enabled/

# Должна быть ссылка на vitrina
```

### 4. Проверка конфигурации Nginx

```bash
cat /etc/nginx/sites-available/vitrina
```

Должна быть конфигурация с:
- `root /var/www/vitrina/frontend/dist;`
- `location /api/` с `proxy_pass http://localhost:3000;`

### 5. Проверка портов

```bash
# Проверить, слушает ли backend на порту 3000
netstat -tulpn | grep 3000

# Проверить, слушает ли Nginx на порту 80
netstat -tulpn | grep :80
```

### 6. Проверка API

```bash
# Проверить health endpoint
curl http://localhost:3000/api/health

# Должен вернуть: {"status":"ok"}
```

## Быстрое исправление

### Если backend не запущен:

```bash
cd /var/www/vitrina/backend
pm2 start src/app.js --name vitrina-backend
pm2 save
```

### Если frontend не собран:

```bash
cd /var/www/vitrina/frontend
npm install
npm run build
```

### Если Nginx не настроен:

```bash
# Создать конфигурацию
sudo nano /etc/nginx/sites-available/vitrina
```

Вставьте:

```nginx
server {
    listen 80;
    server_name 188.215.31.206 altdi.ru www.altdi.ru;

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
}
```

Активировать:

```bash
sudo ln -s /etc/nginx/sites-available/vitrina /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Проверка доступа

После исправления:

1. **Frontend**: `http://188.215.31.206` - должен показать сайт
2. **API Health**: `http://188.215.31.206/api/health` - должен вернуть `{"status":"ok"}`
3. **Backend напрямую**: `http://188.215.31.206:3000/api/health` - должен вернуть `{"status":"ok"}`

## Логи для диагностики

```bash
# Логи backend
pm2 logs vitrina-backend

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
