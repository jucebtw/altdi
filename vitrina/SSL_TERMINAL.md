# 🔒 Получение SSL сертификата через терминал

## Быстрое получение SSL

### Шаг 1: Установка Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Шаг 2: Получение SSL сертификата

```bash
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

Certbot автоматически:
- Получит SSL сертификат
- Обновит конфигурацию Nginx
- Настроит HTTPS

### Шаг 3: Проверка

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить сайт
curl -I https://altdi.ru
```

## Если автоматический способ не работает

### Вариант 1: Standalone режим

```bash
# Остановить Nginx временно
sudo systemctl stop nginx

# Получить сертификат
sudo certbot certonly --standalone -d altdi.ru -d www.altdi.ru

# Запустить Nginx обратно
sudo systemctl start nginx

# Настроить Nginx для использования сертификата
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

### Вариант 2: Webroot режим

```bash
# Убедиться, что Nginx работает
sudo systemctl start nginx

# Получить сертификат через webroot
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d altdi.ru \
  -d www.altdi.ru

# Настроить Nginx
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

## Ручная настройка Nginx для SSL

Если Certbot не настроил автоматически:

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Добавьте SSL конфигурацию:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name altdi.ru www.altdi.ru;

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

Проверьте и перезапустите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Автоматическое обновление

Certbot автоматически настроит обновление. Проверьте:

```bash
# Проверить таймер
sudo systemctl status certbot.timer

# Тестовое обновление
sudo certbot renew --dry-run
```

## Проверка SSL

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить сайт
curl -I https://altdi.ru

# Проверить срок действия
openssl s_client -connect altdi.ru:443 -servername altdi.ru < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

## Решение проблем

### Ошибка: "Failed to connect"

Убедитесь, что:
- DNS настроен правильно: `dig altdi.ru +short` → `188.215.31.206`
- Порты 80 и 443 открыты
- Nginx работает: `sudo systemctl status nginx`

### Ошибка: "Connection refused"

Проверьте firewall:
```bash
sudo iptables -L INPUT -n -v | grep -E "80|443"
```

Если порты закрыты:
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
```

### Ошибка: "Could not find a virtual host"

Убедитесь, что в Nginx конфигурации указан правильный `server_name`:
```nginx
server_name altdi.ru www.altdi.ru;
```
