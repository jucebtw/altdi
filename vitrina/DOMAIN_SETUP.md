# 🌐 Настройка домена altdi.ru

## Шаг 1: Настройка DNS записей

В панели управления вашего доменного регистратора (где вы купили домен altdi.ru) нужно добавить DNS записи:

### Запись A (основная)
```
Тип: A
Имя: @ (или пустое, или altdi.ru)
Значение: 188.215.31.206
TTL: 3600 (или Auto)
```

### Запись A для www
```
Тип: A
Имя: www
Значение: 188.215.31.206
TTL: 3600 (или Auto)
```

### Альтернатива: CNAME для www
```
Тип: CNAME
Имя: www
Значение: altdi.ru
TTL: 3600
```

## Шаг 2: Проверка DNS

После добавления записей подождите 5-30 минут для распространения DNS, затем проверьте:

```bash
# Проверка A записи
dig altdi.ru +short
# Должно вернуть: 188.215.31.206

# Проверка www
dig www.altdi.ru +short
# Должно вернуть: 188.215.31.206

# Или используйте онлайн сервисы:
# https://dnschecker.org/
# https://www.whatsmydns.net/
```

## Шаг 3: Обновление конфигурации Nginx

На сервере выполните:

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Убедитесь, что в конфигурации указан правильный server_name:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

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

Проверьте и перезапустите:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 4: Настройка SSL (HTTPS) через Let's Encrypt

### Установка Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Получение SSL сертификата

```bash
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

Certbot автоматически:
- Получит SSL сертификат
- Обновит конфигурацию Nginx для HTTPS
- Настроит автоматическое обновление

### Проверка автоматического обновления

```bash
sudo certbot renew --dry-run
```

## Шаг 5: Обновление переменных окружения

### Backend .env

```bash
cd /var/www/vitrina/backend
nano .env
```

Обновите:
```env
DOMAIN="altdi.ru"
FRONTEND_URL="https://altdi.ru"
```

### Frontend .env

```bash
cd /var/www/vitrina/frontend
nano .env
```

Убедитесь, что:
```env
VITE_API_URL=/api
```

Или для production:
```env
VITE_API_URL=https://altdi.ru/api
```

### Перезапуск backend

```bash
pm2 restart vitrina-backend
```

### Пересборка frontend (если нужно)

```bash
cd /var/www/vitrina/frontend
npm run build
sudo systemctl reload nginx
```

## Шаг 6: Проверка работы

1. **HTTP**: `http://altdi.ru` - должен работать
2. **HTTPS**: `https://altdi.ru` - должен работать после настройки SSL
3. **API**: `https://altdi.ru/api/health` - должен вернуть `{"status":"ok"}`

## Решение проблем

### Домен не открывается

1. Проверьте DNS:
   ```bash
   dig altdi.ru +short
   ```

2. Проверьте, что Nginx слушает на порту 80:
   ```bash
   sudo netstat -tulpn | grep :80
   ```

3. Проверьте firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 'Nginx Full'
   ```

### Ошибка SSL

1. Проверьте, что домен указывает на правильный IP:
   ```bash
   dig altdi.ru +short
   ```

2. Убедитесь, что порты 80 и 443 открыты:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. Проверьте логи Certbot:
   ```bash
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   ```

### Редирект с www на без www (или наоборот)

Добавьте в Nginx конфигурацию редирект:

```nginx
# Редирект с www на без www
server {
    listen 80;
    listen 443 ssl;
    server_name www.altdi.ru;
    return 301 https://altdi.ru$request_uri;
}

# Основной сервер
server {
    listen 80;
    listen 443 ssl http2;
    server_name altdi.ru;
    # ... остальная конфигурация
}
```

## Автоматическое обновление SSL

Certbot автоматически обновляет сертификаты. Проверьте, что cron задача настроена:

```bash
sudo systemctl status certbot.timer
```

## Проверка конфигурации

После настройки проверьте:

```bash
# Проверка Nginx конфигурации
sudo nginx -t

# Проверка статуса Nginx
sudo systemctl status nginx

# Проверка SSL сертификата
sudo certbot certificates

# Проверка доступности
curl -I https://altdi.ru
```

## Готово! 🎉

После выполнения всех шагов ваш сайт будет доступен по адресу:
- **https://altdi.ru** (с SSL)
- **https://www.altdi.ru** (с SSL)
