# 🔄 Обновление Frontend на сервере

## Проблема: Изменения не отображаются

Если кнопки не появились после обновления кода, нужно пересобрать frontend.

## Шаг 1: Проверка текущей версии

```bash
cd /var/www/vitrina/frontend
ls -la dist/index.html
# Посмотрите дату изменения файла
```

## Шаг 2: Обновление кода

### Если используете Git:
```bash
cd /var/www/vitrina
git pull
```

### Если не используете Git:
Нужно вручную обновить файлы:
- `frontend/src/components/Navbar.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Catalog.jsx`
- `frontend/src/pages/MasterDashboard.jsx`

## Шаг 3: Пересборка Frontend

```bash
cd /var/www/vitrina/frontend

# Убедитесь, что .env настроен
echo "VITE_API_URL=/api" > .env

# Установить зависимости (если нужно)
npm install

# Пересобрать
npm run build

# Проверить, что сборка прошла успешно
ls -la dist/
```

## Шаг 4: Перезагрузка Nginx

```bash
sudo systemctl reload nginx
```

## Шаг 5: Очистка кеша браузера

В браузере:
1. Откройте DevTools (F12)
2. Правый клик на кнопку обновления
3. Выберите "Очистить кеш и жесткая перезагрузка"

Или:
- Chrome/Edge: Ctrl+Shift+Delete → Очистить кеш
- Firefox: Ctrl+Shift+Delete → Очистить кеш

## Проверка

После пересборки проверьте:

1. **Проверьте файлы в dist:**
   ```bash
   grep -r "Мои товары" /var/www/vitrina/frontend/dist/
   ```

2. **Проверьте в браузере:**
   - Откройте DevTools (F12)
   - Вкладка Network
   - Обновите страницу
   - Проверьте, что загружается новый index.html

3. **Проверьте консоль браузера:**
   - Откройте DevTools (F12)
   - Вкладка Console
   - Проверьте, нет ли ошибок

## Быстрая проверка кода на сервере

```bash
# Проверить Navbar
grep "Мои товары" /var/www/vitrina/frontend/src/components/Navbar.jsx

# Должно быть:
# <Nav.Link as={Link} to="/master">
#   Мои товары
# </Nav.Link>
```

## Если все еще не работает

1. Проверьте, что пользователь загружается:
   ```javascript
   // В консоли браузера (F12)
   localStorage.getItem('user')
   localStorage.getItem('token')
   ```

2. Проверьте логи backend:
   ```bash
   pm2 logs vitrina-backend --lines 20
   ```

3. Проверьте, что frontend собран правильно:
   ```bash
   cd /var/www/vitrina/frontend
   npm run build 2>&1 | tail -20
   ```
