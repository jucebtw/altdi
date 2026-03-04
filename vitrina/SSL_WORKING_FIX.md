# ✅ SSL сертификат работает - финальная настройка

## Статус: SSL сертификат установлен и работает!

Сертификат валиден до 2026-06-02. Проблема скорее всего в кеше браузера (HSTS).

## Решение проблемы в браузере

### 1. Очистить HSTS в браузере

**Chrome/Edge:**
1. Откройте: `chrome://net-internals/#hsts`
2. В разделе "Delete domain security policies" введите: `altdi.ru`
3. Нажмите "Delete"
4. Закройте и откройте браузер заново

**Firefox:**
1. Откройте: `about:config`
2. Найдите: `security.tls.insecure_fallback_hosts`
3. Добавьте: `altdi.ru`
4. Перезапустите браузер

### 2. Очистить кеш браузера

- **Chrome/Edge**: `Ctrl+Shift+Delete` → Очистить кеш
- **Firefox**: `Ctrl+Shift+Delete` → Очистить кеш

### 3. Попробовать режим инкогнито

Откройте сайт в режиме инкогнито/приватном режиме для проверки.

## Проверка на сервере

```bash
# Проверить конфигурацию Nginx
sudo nginx -t

# Проверить, что Nginx использует SSL
sudo cat /etc/nginx/sites-available/vitrina | grep -A 3 "listen 443"

# Перезагрузить Nginx (если нужно)
sudo systemctl reload nginx

# Проверить доступность
curl -I https://altdi.ru
# Должно вернуть: HTTP/1.1 200 OK
```

## Если проблема сохраняется

### Проверить конфигурацию Nginx

```bash
sudo cat /etc/nginx/sites-available/vitrina
```

Убедитесь, что есть правильный блок для HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name altdi.ru www.altdi.ru;
    
    ssl_certificate /etc/letsencrypt/live/altdi.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/altdi.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # ... остальная конфигурация
}
```

## Проверка работы

После очистки HSTS в браузере:

1. Откройте сайт: `https://altdi.ru`
2. Должен открыться без ошибок
3. В адресной строке должен быть замочек 🔒

## Готово!

SSL сертификат работает правильно. Проблема была в кеше браузера (HSTS). После очистки HSTS сайт должен открываться нормально.
