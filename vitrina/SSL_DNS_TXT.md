# 🔒 Получение SSL через DNS TXT запись (DNS-01 Challenge)

## Команда для получения сертификата через DNS

```bash
sudo certbot certonly --manual --preferred-challenges dns -d altdi.ru -d www.altdi.ru
```

## Пошаговая инструкция

### Шаг 1: Запуск certbot

```bash
sudo certbot certonly --manual --preferred-challenges dns -d altdi.ru -d www.altdi.ru
```

### Шаг 2: Certbot покажет TXT запись

Certbot выведет что-то вроде:

```
Please deploy a DNS TXT record under the name
_acme-challenge.altdi.ru with the following value:

abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

Before continuing, verify the record is deployed.
```

### Шаг 3: Добавление TXT записи в DNS

В панели управления доменом добавьте:

**TXT запись:**
```
Тип: TXT
Имя: _acme-challenge (или _acme-challenge.altdi.ru)
Значение: abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
TTL: 3600
```

**Для www поддомена:**
```
Тип: TXT
Имя: _acme-challenge.www (или _acme-challenge.www.altdi.ru)
Значение: [другое значение, которое покажет certbot]
TTL: 3600
```

### Шаг 4: Проверка TXT записи

После добавления проверьте (может занять 1-5 минут):

```bash
# Проверка для основного домена
dig _acme-challenge.altdi.ru TXT +short

# Проверка для www
dig _acme-challenge.www.altdi.ru TXT +short
```

Должны вернуться значения, которые показал certbot.

### Шаг 5: Подтверждение в certbot

После проверки TXT записи вернитесь в терминал, где запущен certbot, и нажмите **Enter** для продолжения.

Certbot получит сертификат и сохранит его в `/etc/letsencrypt/live/altdi.ru/`

### Шаг 6: Настройка Nginx для использования сертификата

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
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

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

## Полная команда (одной строкой)

```bash
sudo certbot certonly --manual --preferred-challenges dns -d altdi.ru -d www.altdi.ru --email your-email@example.com --agree-tos --no-eff-email
```

## Автоматическое обновление

После получения сертификата настройте автоматическое обновление:

```bash
# Проверка таймера
sudo systemctl status certbot.timer

# Тестовое обновление
sudo certbot renew --dry-run
```

## Преимущества DNS-01 challenge

✅ Работает даже если порт 80 закрыт
✅ Не требует доступа к веб-серверу
✅ Можно получить wildcard сертификат (*.altdi.ru)

## Недостатки

❌ Нужно вручную добавлять TXT записи
❌ Медленнее, чем HTTP-01 (нужно ждать распространения DNS)

## Альтернатива: Автоматический DNS плагин

Если ваш DNS провайдер поддерживается, можно использовать автоматический плагин:

```bash
# Для Cloudflare
sudo certbot certonly --dns-cloudflare -d altdi.ru -d www.altdi.ru

# Для других провайдеров смотрите: certbot plugins
sudo certbot plugins
```

## Проверка сертификата

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить сайт
curl -I https://altdi.ru

# Проверить срок действия
openssl s_client -connect altdi.ru:443 -servername altdi.ru < /dev/null 2>/dev/null | openssl x509 -noout -dates
```
