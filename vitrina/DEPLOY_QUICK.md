# ⚡ Быстрый деплой на сервер

## Минимальные шаги для развертывания

### 1. Подключитесь к серверу
```bash
ssh root@ваш-сервер-ip
```

### 2. Загрузите проект
```bash
cd /var/www
git clone https://github.com/jucebtw/altdi.git
cd altdi
git checkout cursor/-bc-9c08d9df-b8f4-418a-b5e8-6b2140f9095d-060f
cp -r vitrina /var/www/vitrina
cd /var/www/vitrina
```

### 3. Настройте .env
```bash
cd backend
cp .env.example .env
nano .env  # Отредактируйте файл
```

**Обязательно измените:**
- `JWT_SECRET` - сгенерируйте: `openssl rand -base64 32`
- `TG_BOT_TOKEN` - уже указан
- `DOMAIN` - уже указан "altdi.ru"
- `FRONTEND_URL` - добавьте: `https://altdi.ru`

### 4. Запустите деплой
```bash
cd /var/www/vitrina
chmod +x deploy.sh
./deploy.sh
```

### 5. Создайте администратора
```bash
cd /var/www/vitrina/backend
npm run create-admin
```

### 6. Настройте SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

### 7. Готово! 🎉
Откройте `https://altdi.ru` в браузере.

---

## Обновление проекта

```bash
cd /var/www/vitrina
./update.sh
```

---

## Полезные команды

```bash
# Логи backend
pm2 logs vitrina-backend

# Перезапуск backend
pm2 restart vitrina-backend

# Статус
pm2 status

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
```

---

**Подробная инструкция:** см. `DEPLOY.md`
