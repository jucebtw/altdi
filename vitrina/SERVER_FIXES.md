# 🔧 Исправления на сервере

## Проблемы в логах:

1. **findUnique вместо findFirst** в login
2. **trust proxy = true** вместо trust proxy = 1

## Исправление на сервере

### 1. Исправить trust proxy

```bash
cd /var/www/vitrina/backend
nano src/app.js
```

Найдите строку (примерно строка 17):
```javascript
app.set('trust proxy', true);
```

Замените на:
```javascript
app.set('trust proxy', 1); // Доверяем только первому прокси (Nginx)
```

Сохраните (Ctrl+O, Enter, Ctrl+X)

### 2. Исправить findUnique в login

```bash
nano src/controllers/authController.js
```

Найдите функцию `login` (примерно строка 173-185) и найдите:
```javascript
const user = await prisma.user.findUnique({
  where: { fio },
});
```

Замените на:
```javascript
// Используем findFirst, так как fio не уникальное поле в схеме
const user = await prisma.user.findFirst({
  where: { fio },
});
```

Сохраните (Ctrl+O, Enter, Ctrl+X)

### 3. Перезапустить backend

```bash
pm2 restart vitrina-backend
pm2 logs vitrina-backend --lines 10
```

### 4. Проверить работу

```bash
# Проверить API
curl http://localhost:3000/api/health
# Должно вернуть: {"status":"ok"}

# Проверить через Nginx
curl https://altdi.ru/api/health
# Должно вернуть: {"status":"ok"}
```

## Быстрое исправление одной командой

```bash
cd /var/www/vitrina/backend

# Исправить trust proxy
sed -i "s/app.set('trust proxy', true);/app.set('trust proxy', 1); \/\/ Доверяем только первому прокси (Nginx)/" src/app.js

# Исправить findUnique
sed -i 's/prisma\.user\.findUnique({/prisma.user.findFirst({/g' src/controllers/authController.js

# Перезапустить
pm2 restart vitrina-backend

# Проверить
pm2 logs vitrina-backend --err --lines 5
curl http://localhost:3000/api/health
```

## Проверка после исправления

```bash
# Проверить, что ошибок больше нет
pm2 logs vitrina-backend --err --lines 10

# Должно быть пусто или только старые ошибки

# Проверить работу
curl http://localhost:3000/api/health
curl https://altdi.ru/api/health
```
