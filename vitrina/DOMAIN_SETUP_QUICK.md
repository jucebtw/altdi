# 🚀 Быстрая настройка домена (без Git)

## Шаг 1: Настройка DNS (в панели домена)

В панели управления доменом добавьте:

**A запись:**
- Тип: A
- Имя: @ (или пустое)
- Значение: 188.215.31.206
- TTL: 3600

**A запись для www:**
- Тип: A  
- Имя: www
- Значение: 188.215.31.206
- TTL: 3600

## Шаг 2: Обновление Nginx на сервере

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Замените `server_name` на:
```nginx
server_name altdi.ru www.altdi.ru 188.215.31.206;
```

Проверьте и перезапустите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 3: Настройка SSL

```bash
# Установка Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

## Шаг 4: Обновление .env

```bash
# Backend
cd /var/www/vitrina/backend
sudo nano .env
```

Добавьте/измените:
```env
DOMAIN="altdi.ru"
FRONTEND_URL="https://altdi.ru"
```

```bash
# Перезапуск backend
pm2 restart vitrina-backend
```

## Готово!

Проверьте: `https://altdi.ru`
