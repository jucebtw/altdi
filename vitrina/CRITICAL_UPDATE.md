# 🚨 КРИТИЧЕСКОЕ ОБНОВЛЕНИЕ - Обязательно выполнить!

## Проблема: Изменения не видны на сайте

Frontend на сервере НЕ ПЕРЕСОБРАН после обновления кода.

## ⚠️ ОБЯЗАТЕЛЬНО ВЫПОЛНИТЬ НА СЕРВЕРЕ:

```bash
cd /var/www/vitrina/frontend

# 1. Убедиться, что код обновлен (если Git настроен)
# git pull

# 2. ПЕРЕСОБРАТЬ FRONTEND (ОБЯЗАТЕЛЬНО!)
npm run build

# 3. Проверить, что сборка прошла
ls -la dist/index.html

# 4. Перезагрузить Nginx
sudo systemctl reload nginx

# 5. ОЧИСТИТЬ КЕШ БРАУЗЕРА
# В браузере: Ctrl+Shift+Delete → Очистить кеш
# Или: Ctrl+Shift+R (жесткая перезагрузка)
```

## Проверка после обновления

```bash
# Проверить, что кнопка есть в собранном файле
grep -r "Добавить товар" /var/www/vitrina/frontend/dist/ | head -3

# Должно показать упоминания кнопки
```

## Если не используете Git

Обновите файлы вручную на сервере:

### 1. Navbar.jsx

Файл: `/var/www/vitrina/frontend/src/components/Navbar.jsx`

Найдите блок с `{user ? (` и замените на:

```javascript
{user ? (
  <>
    <Nav.Item className="d-flex align-items-center me-2">
      <Link to="/master" className="btn btn-success text-white" style={{ borderRadius: '4px', padding: '8px 16px', fontSize: '16px', fontWeight: 'bold' }}>
        ➕ Добавить товар
      </Link>
    </Nav.Item>
    <Nav.Link as={Link} to="/master">
      Мои товары
    </Nav.Link>
```

### 2. Register.jsx

Файл: `/var/www/vitrina/frontend/src/pages/Register.jsx`

После строки `<Card.Body>` добавьте ПЕРЕД формой:

```javascript
<Alert variant="warning" className="mb-4">
  <strong>⚠️ ВАЖНО!</strong> Перед регистрацией обязательно напишите боту{' '}
  <a href="https://t.me/altdiverf_bot" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold' }}>
    @altdiverf_bot
  </a>{' '}
  команду <strong>/start</strong>
  <br />
  <small>Иначе код верификации не будет отправлен и вы не сможете завершить регистрацию!</small>
</Alert>
```

### 3. После обновления файлов

```bash
cd /var/www/vitrina/frontend
npm run build
sudo systemctl reload nginx
```

## ГДЕ ДОЛЖНА БЫТЬ КНОПКА:

1. **В Navbar (верхнее меню)** - справа, зеленая кнопка "➕ Добавить товар"
2. **На главной странице** - рядом с кнопкой "Перейти в каталог"
3. **В каталоге** - большая кнопка сверху страницы

## ГДЕ ДОЛЖНО БЫТЬ ПРЕДУПРЕЖДЕНИЕ:

1. **При регистрации** - желтое предупреждение в начале формы
2. **На главной странице** (для неавторизованных) - информация о боте

## ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ:

```bash
# Полная пересборка
cd /var/www/vitrina/frontend
rm -rf dist node_modules
npm install
npm run build
sudo systemctl restart nginx
```
