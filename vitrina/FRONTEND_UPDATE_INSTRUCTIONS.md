# Инструкция по обновлению Frontend на сервере

## Проблема
Собранный frontend на сервере содержит старый код, потому что исходные файлы не были обновлены перед сборкой.

## Решение

### Вариант 1: Использовать скрипт обновления (РЕКОМЕНДУЕТСЯ)

1. **Скопируйте скрипт на сервер:**
   ```bash
   # С вашего локального компьютера
   scp vitrina/update-frontend-server.sh root@188.215.31.206:/var/www/vitrina/
   ```

2. **Запустите скрипт на сервере:**
   ```bash
   ssh root@188.215.31.206
   cd /var/www/vitrina
   bash update-frontend-server.sh
   ```

   Скрипт автоматически:
   - Обновит все необходимые файлы (Navbar.jsx, Home.jsx, Catalog.jsx, Register.jsx)
   - Пересоберет frontend
   - Перезагрузит Nginx

3. **Очистите кеш браузера:**
   - Нажмите `Ctrl+Shift+R` (Windows/Linux) или `Cmd+Shift+R` (Mac)
   - Или откройте сайт в режиме инкогнито

### Вариант 2: Ручное обновление

Если скрипт не работает, выполните команды вручную на сервере:

```bash
cd /var/www/vitrina/frontend

# 1. Обновить Navbar.jsx
cat > src/components/Navbar.jsx << 'NAVBAR_EOF'
[вставьте содержимое файла Navbar.jsx из рабочей области]
NAVBAR_EOF

# 2. Обновить Home.jsx
cat > src/pages/Home.jsx << 'HOME_EOF'
[вставьте содержимое файла Home.jsx из рабочей области]
HOME_EOF

# 3. Обновить Catalog.jsx
cat > src/pages/Catalog.jsx << 'CATALOG_EOF'
[вставьте содержимое файла Catalog.jsx из рабочей области]
CATALOG_EOF

# 4. Обновить Register.jsx
cat > src/pages/Register.jsx << 'REGISTER_EOF'
[вставьте содержимое файла Register.jsx из рабочей области]
REGISTER_EOF

# 5. Пересобрать frontend
npm run build

# 6. Перезагрузить Nginx
sudo systemctl reload nginx
```

### Вариант 3: Использовать Git (если настроен)

Если на сервере настроен Git:

```bash
cd /var/www/vitrina
git pull origin main  # или master, в зависимости от вашей ветки
cd frontend
npm install
npm run build
sudo systemctl reload nginx
```

## Проверка

После обновления проверьте:

1. **В собранном файле должна быть кнопка:**
   ```bash
   grep "Добавить товар" /var/www/vitrina/frontend/dist/assets/*.js | head -1
   ```
   Должна найтись строка с "Добавить товар"

2. **В браузере:**
   - Откройте сайт https://altdi.ru
   - Войдите в систему
   - Кнопка "➕ Добавить товар" должна быть видна в навбаре и на главной странице
   - На странице регистрации должно быть предупреждение о боте

## Если не помогло

1. Убедитесь, что файлы действительно обновились:
   ```bash
   grep "user.role===\"Master\"" /var/www/vitrina/frontend/src/components/Navbar.jsx
   ```
   Если команда ничего не нашла - файл обновлен правильно.

2. Проверьте, что сборка прошла успешно:
   ```bash
   cd /var/www/vitrina/frontend
   npm run build
   ```
   Не должно быть ошибок.

3. Очистите кеш браузера полностью или откройте в режиме инкогнито.

4. Проверьте, что Nginx обслуживает правильную директорию:
   ```bash
   ls -la /var/www/vitrina/frontend/dist/index.html
   ```
   Файл должен существовать и иметь свежую дату модификации.
