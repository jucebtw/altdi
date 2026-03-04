# 🔒 Исправление ошибки "Невозможно установить безопасное соединение"

## Проблема: Ошибка SSL/HSTS в браузере

Браузер блокирует сайт из-за проблем с SSL сертификатом.

## Причины и решения

### 1. SSL сертификат не настроен или неправильно настроен

**Проверка на сервере:**

```bash
# Проверить наличие сертификата
sudo certbot certificates

# Если сертификата нет - получить
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

### 2. Неправильная конфигурация Nginx

**Проверка конфигурации:**

```bash
sudo cat /etc/nginx/sites-available/vitrina | grep -A 5 "listen 443"
```

Должно быть:
```nginx
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;
```

### 3. Проблема с HSTS

Если HSTS был включен, но сертификат не работает, браузер блокирует сайт.

**Решение: Временно отключить HSTS или исправить SSL**

## Полное исправление

### Шаг 1: Проверить SSL сертификат

```bash
# Проверить сертификаты
sudo certbot certificates

# Если сертификата нет или истек
sudo certbot renew
# или
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

### Шаг 2: Исправить конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

**Правильная конфигурация для HTTPS:**

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Безопасность
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

### Шаг 3: Проверить и перезапустить

```bash
# Проверить конфигурацию
sudo nginx -t

# Если ошибок нет
sudo systemctl restart nginx

# Проверить SSL
curl -I https://altdi.ru
openssl s_client -connect altdi.ru:443 -servername altdi.ru < /dev/null 2>/dev/null | openssl x509 -noout -subject -dates
```

### Шаг 4: Очистить HSTS в браузере

Если проблема с HSTS:

**Chrome/Edge:**
1. Откройте `chrome://net-internals/#hsts`
2. В разделе "Delete domain security policies" введите: `altdi.ru`
3. Нажмите "Delete"

**Firefox:**
1. Откройте `about:config`
2. Найдите `security.tls.insecure_fallback_hosts`
3. Добавьте `altdi.ru`

**Или используйте режим инкогнито** для проверки

## Временное решение: Отключить HTTPS

Если нужно срочно открыть сайт, можно временно отключить HTTPS:

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Используйте только HTTP (без редиректа на HTTPS):

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

Проверьте и перезапустите:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Проверка SSL сертификата

```bash
# Проверить сертификат
sudo certbot certificates

# Проверить срок действия
openssl s_client -connect altdi.ru:443 -servername altdi.ru < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Проверить цепочку сертификатов
openssl s_client -connect altdi.ru:443 -servername altdi.ru < /dev/null 2>/dev/null | openssl x509 -noout -text | grep -A 2 "Issuer"
```

## Рекомендуемое решение

1. Получить новый SSL сертификат через Certbot
2. Убедиться, что конфигурация Nginx правильная
3. Очистить HSTS в браузере
4. Попробовать открыть сайт снова
