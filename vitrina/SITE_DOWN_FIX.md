# 🔧 Исправление проблемы "Не удалось установить соединение"

## Быстрая диагностика на сервере

### 1. Проверка Backend (PM2)

```bash
# Проверить статус
pm2 status

# Если backend не запущен:
cd /var/www/vitrina/backend
pm2 start src/app.js --name vitrina-backend
pm2 save

# Проверить логи
pm2 logs vitrina-backend --lines 50
```

### 2. Проверка Nginx

```bash
# Проверить статус
sudo systemctl status nginx

# Если не работает, запустить:
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверить конфигурацию
sudo nginx -t

# Проверить логи
sudo tail -f /var/log/nginx/error.log
```

### 3. Проверка портов

```bash
# Проверить, слушает ли backend на порту 3000
sudo netstat -tulpn | grep 3000

# Проверить, слушает ли Nginx на порту 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### 4. Проверка Firewall

```bash
# Проверить статус UFW
sudo ufw status

# Открыть порты если нужно
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw reload
```

### 5. Проверка DNS

```bash
# Проверить, что домен указывает на правильный IP
dig altdi.ru +short
# Должно вернуть: 188.215.31.206

# Проверить с сервера
curl -I http://localhost
curl -I http://localhost:3000/api/health
```

## Пошаговое исправление

### Шаг 1: Запустить Backend

```bash
cd /var/www/vitrina/backend

# Проверить .env
cat .env | grep -E "PORT|JWT_SECRET|TG_BOT_TOKEN"

# Запустить через PM2
pm2 start src/app.js --name vitrina-backend
pm2 save

# Проверить
pm2 logs vitrina-backend --lines 20
```

### Шаг 2: Проверить и запустить Nginx

```bash
# Проверить конфигурацию
sudo nginx -t

# Если ошибки - исправить
sudo nano /etc/nginx/sites-available/vitrina

# Запустить/перезапустить
sudo systemctl start nginx
sudo systemctl reload nginx

# Проверить статус
sudo systemctl status nginx
```

### Шаг 3: Проверить конфигурацию Nginx

```bash
sudo cat /etc/nginx/sites-available/vitrina
```

Должна быть конфигурация с:
- `server_name altdi.ru www.altdi.ru;`
- `root /var/www/vitrina/frontend/dist;`
- `location /api/` с `proxy_pass http://localhost:3000;`

### Шаг 4: Проверить Frontend

```bash
# Проверить, что frontend собран
ls -la /var/www/vitrina/frontend/dist/

# Если нет - собрать
cd /var/www/vitrina/frontend
npm run build
```

### Шаг 5: Проверить Firewall

```bash
# Проверить статус
sudo ufw status

# Если порты закрыты, открыть:
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw reload
```

## Быстрое исправление (все команды)

```bash
# 1. Запустить backend
cd /var/www/vitrina/backend
pm2 restart vitrina-backend || pm2 start src/app.js --name vitrina-backend
pm2 save

# 2. Проверить и запустить Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl reload nginx

# 3. Проверить frontend
ls -la /var/www/vitrina/frontend/dist/index.html || (cd /var/www/vitrina/frontend && npm run build)

# 4. Открыть порты
sudo ufw allow 'Nginx Full'
sudo ufw reload

# 5. Проверить
pm2 status
sudo systemctl status nginx
curl -I http://localhost:3000/api/health
curl -I http://localhost
```

## Проверка доступности

### С сервера:

```bash
# Backend API
curl http://localhost:3000/api/health
# Должно вернуть: {"status":"ok"}

# Frontend через Nginx
curl -I http://localhost
# Должно вернуть HTTP 200

# Через домен (если DNS настроен)
curl -I http://altdi.ru
curl -I https://altdi.ru
```

### Извне:

```bash
# С вашего компьютера
curl -I http://188.215.31.206
curl -I https://altdi.ru
```

## Частые проблемы и решения

### Проблема: "Connection refused"

**Причина:** Backend не запущен или порт закрыт

**Решение:**
```bash
pm2 start src/app.js --name vitrina-backend
sudo ufw allow 3000/tcp  # Если нужно
```

### Проблема: "502 Bad Gateway"

**Причина:** Nginx не может подключиться к backend

**Решение:**
```bash
# Проверить, что backend запущен
pm2 status

# Проверить порт 3000
netstat -tulpn | grep 3000

# Перезапустить backend
pm2 restart vitrina-backend
```

### Проблема: "404 Not Found"

**Причина:** Frontend не собран или неправильный путь

**Решение:**
```bash
cd /var/www/vitrina/frontend
npm run build
sudo systemctl reload nginx
```

### Проблема: "SSL certificate error"

**Причина:** Проблема с SSL сертификатом

**Решение:**
```bash
# Проверить сертификат
sudo certbot certificates

# Обновить сертификат
sudo certbot renew

# Перезапустить Nginx
sudo systemctl reload nginx
```

## Полная перезагрузка всех сервисов

```bash
# Backend
pm2 restart vitrina-backend

# Nginx
sudo systemctl restart nginx

# Проверить
pm2 status
sudo systemctl status nginx
```

## Логи для диагностики

```bash
# Логи backend
pm2 logs vitrina-backend --lines 100

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Системные логи
sudo journalctl -u nginx -n 50
```

## Проверка после исправления

1. **Backend работает:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Nginx работает:**
   ```bash
   curl -I http://localhost
   ```

3. **Сайт доступен:**
   - Откройте в браузере: `https://altdi.ru`
   - Или по IP: `http://188.215.31.206`

## Если ничего не помогает

1. Проверьте, что сервер доступен:
   ```bash
   ping 188.215.31.206
   ```

2. Проверьте DNS:
   ```bash
   dig altdi.ru +short
   ```

3. Проверьте все сервисы:
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status certbot.timer
   ```
