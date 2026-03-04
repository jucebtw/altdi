# 🚀 Подробное руководство по развертыванию на сервере

## Предварительные требования

- Ubuntu 20.04+ сервер с доступом по SSH
- Домен `altdi.ru` настроен и указывает на IP вашего сервера
- Права root или sudo на сервере

## Вариант 1: Автоматический деплой (рекомендуется)

### Шаг 1: Подключение к серверу

```bash
ssh root@ваш-сервер-ip
# или
ssh ваш-пользователь@ваш-сервер-ip
```

### Шаг 2: Загрузка проекта на сервер

**Вариант A: Через Git (рекомендуется)**

```bash
# Установка Git (если не установлен)
sudo apt update
sudo apt install -y git

# Клонирование репозитория
cd /var/www
sudo git clone https://github.com/jucebtw/altdi.git
cd altdi
sudo git checkout cursor/-bc-9c08d9df-b8f4-418a-b5e8-6b2140f9095d-060f

# Копирование проекта в рабочую директорию
sudo cp -r vitrina /var/www/vitrina
cd /var/www/vitrina
```

**Вариант B: Через rsync (с локальной машины)**

```bash
# С вашего локального компьютера
rsync -avz --exclude 'node_modules' --exclude '.git' \
  vitrina/ root@ваш-сервер-ip:/var/www/vitrina/
```

**Вариант C: Через SCP**

```bash
# С вашего локального компьютера
scp -r vitrina root@ваш-сервер-ip:/var/www/
```

### Шаг 3: Настройка переменных окружения

```bash
cd /var/www/vitrina/backend
sudo cp .env.example .env
sudo nano .env
```

Настройте `.env` файл:
```env
DATABASE_URL="file:./database.sqlite"
JWT_SECRET="сгенерируйте-случайную-строку-минимум-32-символа-для-безопасности"
PORT=3000
TG_BOT_TOKEN="8758089130:AAG28a56mhd_lSmOC3ePTlkG4mjotFHBqqU"
DOMAIN="altdi.ru"
YOOKASSA_SHOP_ID="ваш-yookassa-shop-id"
YOOKASSA_SECRET_KEY="ваш-yookassa-secret-key"
FRONTEND_URL="https://altdi.ru"
```

**Генерация JWT_SECRET:**
```bash
openssl rand -base64 32
```

### Шаг 4: Запуск скрипта деплоя

```bash
cd /var/www/vitrina
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

Скрипт автоматически:
- Установит Node.js 20+
- Установит PM2
- Установит и настроит Nginx
- Установит зависимости
- Настроит базу данных
- Запустит backend через PM2
- Соберет frontend
- Настроит Nginx конфигурацию

### Шаг 5: Создание первого администратора

```bash
cd /var/www/vitrina/backend
sudo npm run create-admin
```

Введите данные администратора.

### Шаг 6: Настройка SSL (HTTPS)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d altdi.ru -d www.altdi.ru

# Автоматическое обновление (настроено автоматически)
```

### Шаг 7: Проверка работы

1. Откройте в браузере: `https://altdi.ru`
2. Проверьте API: `https://altdi.ru/api/health`
3. Проверьте логи PM2: `pm2 logs vitrina-backend`
4. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`

---

## Вариант 2: Ручной деплой (пошагово)

### Шаг 1: Установка Node.js 20+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Должно быть v20.x.x
```

### Шаг 2: Установка PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### Шаг 3: Установка Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Шаг 4: Загрузка проекта

См. "Шаг 2" из Варианта 1.

### Шаг 5: Настройка Backend

```bash
cd /var/www/vitrina/backend

# Установка зависимостей
sudo npm install --production

# Настройка .env (см. выше)

# Генерация Prisma клиента
sudo npx prisma generate

# Применение миграций
sudo npx prisma migrate deploy

# Создание администратора
sudo npm run create-admin
```

### Шаг 6: Запуск Backend через PM2

```bash
cd /var/www/vitrina/backend

# Запуск приложения
sudo pm2 start src/app.js --name vitrina-backend

# Сохранение конфигурации PM2
sudo pm2 save

# Настройка автозапуска при перезагрузке
sudo pm2 startup systemd
# Выполните команду, которую выведет PM2

# Проверка статуса
pm2 status
pm2 logs vitrina-backend
```

### Шаг 7: Сборка Frontend

```bash
cd /var/www/vitrina/frontend

# Создание .env для production
echo 'VITE_API_URL=https://altdi.ru/api' | sudo tee .env

# Установка зависимостей
sudo npm install

# Сборка для production
sudo npm run build

# Проверка сборки
ls -la dist/
```

### Шаг 8: Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/vitrina
```

Вставьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name altdi.ru www.altdi.ru;

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

Активация конфигурации:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/vitrina /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### Шаг 9: Настройка прав доступа

```bash
# Установка владельца
sudo chown -R www-data:www-data /var/www/vitrina

# Права на директории
sudo chmod -R 755 /var/www/vitrina

# Права на uploads (запись)
sudo chmod -R 775 /var/www/vitrina/uploads
```

### Шаг 10: Настройка SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d altdi.ru -d www.altdi.ru
```

Certbot автоматически обновит конфигурацию Nginx для HTTPS.

### Шаг 11: Настройка Firewall

```bash
# Если используется UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
sudo ufw status
```

---

## Обновление проекта

### Через Git

```bash
cd /var/www/vitrina
sudo git pull origin cursor/-bc-9c08d9df-b8f4-418a-b5e8-6b2140f9095d-060f

# Backend
cd backend
sudo npm install --production
sudo npx prisma generate
sudo npx prisma migrate deploy
sudo pm2 restart vitrina-backend

# Frontend
cd ../frontend
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

---

## Управление приложением

### PM2 команды

```bash
# Статус
pm2 status

# Логи
pm2 logs vitrina-backend
pm2 logs vitrina-backend --lines 100

# Перезапуск
pm2 restart vitrina-backend

# Остановка
pm2 stop vitrina-backend

# Удаление
pm2 delete vitrina-backend

# Мониторинг
pm2 monit
```

### Nginx команды

```bash
# Перезапуск
sudo systemctl restart nginx

# Проверка конфигурации
sudo nginx -t

# Перезагрузка конфигурации
sudo systemctl reload nginx

# Логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Решение проблем

### Backend не запускается

```bash
# Проверка логов
pm2 logs vitrina-backend

# Проверка порта
sudo netstat -tulpn | grep 3000

# Проверка .env файла
cat /var/www/vitrina/backend/.env

# Проверка базы данных
cd /var/www/vitrina/backend
sudo npx prisma studio
```

### Frontend не отображается

```bash
# Проверка сборки
ls -la /var/www/vitrina/frontend/dist/

# Проверка прав
ls -la /var/www/vitrina/frontend/dist/

# Проверка Nginx конфигурации
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Ошибки 502 Bad Gateway

```bash
# Проверка, запущен ли backend
pm2 status

# Проверка порта 3000
sudo netstat -tulpn | grep 3000

# Проверка логов backend
pm2 logs vitrina-backend
```

### Проблемы с загрузкой изображений

```bash
# Проверка прав на uploads
ls -la /var/www/vitrina/uploads/
sudo chmod -R 775 /var/www/vitrina/uploads
sudo chown -R www-data:www-data /var/www/vitrina/uploads
```

### Telegram бот не работает

1. Проверьте токен в `.env`
2. Убедитесь, что пользователи пишут боту `/start` перед регистрацией
3. Проверьте логи: `pm2 logs vitrina-backend | grep telegram`

---

## Бэкапы

### Резервное копирование базы данных

```bash
# Создание бэкапа
sudo cp /var/www/vitrina/backend/database.sqlite \
  /var/www/vitrina/backend/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)

# Автоматический бэкап (добавьте в crontab)
# Каждый день в 3:00
0 3 * * * cp /var/www/vitrina/backend/database.sqlite /backups/database_$(date +\%Y\%m\%d).sqlite
```

### Резервное копирование uploads

```bash
sudo tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/vitrina/uploads/
```

---

## Мониторинг

### Настройка мониторинга PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Проверка использования ресурсов

```bash
# CPU и память
pm2 monit

# Дисковое пространство
df -h

# Использование памяти
free -h
```

---

## Безопасность

1. **Firewall**: Настройте UFW или iptables
2. **SSH**: Используйте ключи вместо паролей
3. **JWT_SECRET**: Используйте длинный случайный ключ
4. **Обновления**: Регулярно обновляйте систему
5. **SSL**: Обязательно используйте HTTPS
6. **Резервные копии**: Настройте автоматические бэкапы

---

## Контакты и поддержка

При возникновении проблем проверьте:
- Логи PM2: `pm2 logs vitrina-backend`
- Логи Nginx: `/var/log/nginx/error.log`
- Статус сервисов: `systemctl status nginx`, `pm2 status`
