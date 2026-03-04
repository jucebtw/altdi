# 🔒 Получение SSL сертификата через тестовый файл (HTTP-01 challenge)

## Способ 1: Автоматический (Certbot делает сам)

Certbot автоматически создает тестовый файл для верификации. Просто выполните:

```bash
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

Certbot автоматически:
1. Создаст файл в `.well-known/acme-challenge/`
2. Настроит Nginx для доступа к нему
3. Получит сертификат
4. Обновит конфигурацию Nginx

## Способ 2: Ручная настройка (если автоматический не работает)

### Шаг 1: Настройка Nginx для верификации

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Добавьте перед основными location блоками:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru 188.215.31.206;

    # Для Let's Encrypt верификации
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

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

Проверьте и перезапустите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 2: Создание директории для challenge

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html/.well-known
```

### Шаг 3: Получение сертификата

```bash
# Certbot автоматически создаст файл и получит сертификат
sudo certbot certonly --webroot -w /var/www/html -d altdi.ru -d www.altdi.ru
```

Или через Nginx плагин (проще):
```bash
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

## Способ 3: Полностью ручной (standalone)

Если Nginx не работает или нужен standalone режим:

```bash
# Остановить Nginx временно
sudo systemctl stop nginx

# Получить сертификат в standalone режиме
sudo certbot certonly --standalone -d altdi.ru -d www.altdi.ru

# Запустить Nginx обратно
sudo systemctl start nginx

# Настроить Nginx для использования сертификата
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

## Способ 4: Ручное создание тестового файла

Если нужно создать файл вручную для проверки:

```bash
# Создать директорию
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Создать тестовый файл
echo "test-verification-file" | sudo tee /var/www/html/.well-known/acme-challenge/test.txt

# Проверить доступность
curl http://altdi.ru/.well-known/acme-challenge/test.txt
# Должно вернуть: test-verification-file
```

## Проверка работы

После получения сертификата:

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить сайт
curl -I https://altdi.ru

# Проверить срок действия
sudo certbot certificates | grep "Expiry Date"
```

## Автоматическое обновление

Certbot автоматически настроит обновление. Проверьте:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Решение проблем

### Ошибка: "Failed to connect"

Убедитесь, что:
1. Порты 80 и 443 открыты: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`
2. Nginx работает: `sudo systemctl status nginx`
3. DNS указывает на правильный IP: `dig altdi.ru +short`

### Ошибка: "Could not find a virtual host"

Убедитесь, что в Nginx конфигурации указан правильный `server_name`:
```nginx
server_name altdi.ru www.altdi.ru;
```

### Ошибка: "Connection refused"

Проверьте firewall:
```bash
sudo ufw status
sudo ufw allow 'Nginx Full'
```

## Готово!

После успешного получения сертификата сайт будет доступен по HTTPS:
- https://altdi.ru
- https://www.altdi.ru
