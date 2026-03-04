# 🔒 Получение SSL через тестовый TXT файл (HTTP-01 Challenge)

## Что это такое?

Let's Encrypt проверяет владение доменом, запрашивая специальный файл по адресу:
`http://ваш-домен/.well-known/acme-challenge/токен-файл`

## Способ 1: Certbot делает автоматически (рекомендуется)

Certbot сам создаст файл и получит сертификат:

```bash
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

## Способ 2: Ручное создание через certbot certonly

### Шаг 1: Подготовка Nginx

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Добавьте в блок `server`:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru;

    # Для Let's Encrypt верификации
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # ... остальная конфигурация
}
```

Проверьте и перезапустите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 2: Создание директории

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html/.well-known
sudo chmod -R 755 /var/www/html/.well-known
```

### Шаг 3: Получение сертификата (certbot создаст файл сам)

```bash
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d altdi.ru \
  -d www.altdi.ru
```

Certbot автоматически:
1. Создаст токен-файл в `/var/www/html/.well-known/acme-challenge/`
2. Попросит Let's Encrypt проверить файл
3. Получит сертификат

## Способ 3: Полностью ручной (для понимания процесса)

### Шаг 1: Запрос токена от Let's Encrypt

```bash
# Установка acme.sh (альтернатива certbot)
curl https://get.acme.sh | sh

# Или используйте certbot в manual режиме
sudo certbot certonly --manual -d altdi.ru -d www.altdi.ru
```

Certbot покажет вам:
- Имя файла (например: `abc123def456`)
- Содержимое файла (например: `xyz789uvw012`)

### Шаг 2: Создание файла вручную

```bash
# Создать директорию
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Создать файл с содержимым, которое показал certbot
echo "xyz789uvw012" | sudo tee /var/www/html/.well-known/acme-challenge/abc123def456

# Проверить права
sudo chown www-data:www-data /var/www/html/.well-known/acme-challenge/abc123def456
sudo chmod 644 /var/www/html/.well-known/acme-challenge/abc123def456
```

### Шаг 3: Настройка Nginx для доступа к файлу

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Добавьте:

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/html;
    try_files $uri =404;
}
```

Проверьте доступность:
```bash
# Проверить локально
curl http://localhost/.well-known/acme-challenge/abc123def456

# Проверить через домен (должен работать после настройки DNS)
curl http://altdi.ru/.well-known/acme-challenge/abc123def456
```

### Шаг 4: Подтверждение в certbot

Вернитесь в терминал, где запущен certbot, и нажмите Enter для продолжения.

## Способ 4: Тестирование вручную (для проверки)

Если хотите просто проверить, что файл доступен:

```bash
# Создать тестовый файл
sudo mkdir -p /var/www/html/.well-known/acme-challenge
echo "test-verification-12345" | sudo tee /var/www/html/.well-known/acme-challenge/test.txt

# Настроить Nginx (если еще не настроено)
sudo nano /etc/nginx/sites-available/vitrina
# Добавьте location /.well-known/acme-challenge/

# Проверить доступность
curl http://altdi.ru/.well-known/acme-challenge/test.txt
# Должно вернуть: test-verification-12345
```

## Полная пошаговая инструкция

### 1. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Добавьте перед другими location:

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/html;
    try_files $uri =404;
}
```

### 2. Создание директории

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html/.well-known
```

### 3. Проверка Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Получение сертификата

```bash
# Установка certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата (certbot создаст файл автоматически)
sudo certbot certonly --webroot -w /var/www/html -d altdi.ru -d www.altdi.ru
```

Или через Nginx плагин (самый простой):
```bash
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

## Проверка работы

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить сайт
curl -I https://altdi.ru

# Посмотреть содержимое директории challenge
ls -la /var/www/html/.well-known/acme-challenge/
```

## Важные моменты

1. **DNS должен быть настроен** - домен должен указывать на ваш IP
2. **Порт 80 должен быть открыт** - `sudo ufw allow 80/tcp`
3. **Nginx должен работать** - `sudo systemctl status nginx`
4. **Файл должен быть доступен** - проверьте через `curl http://altdi.ru/.well-known/acme-challenge/файл`

## Решение проблем

### Файл не доступен

```bash
# Проверить права
ls -la /var/www/html/.well-known/acme-challenge/

# Проверить Nginx конфигурацию
sudo nginx -t

# Проверить логи
sudo tail -f /var/log/nginx/error.log
```

### Ошибка доступа

```bash
# Исправить права
sudo chown -R www-data:www-data /var/www/html/.well-known
sudo chmod -R 755 /var/www/html/.well-known
```

## Готово!

После успешного получения сертификата:
- Сайт будет доступен по HTTPS: https://altdi.ru
- Certbot автоматически настроит обновление сертификата
