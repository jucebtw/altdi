# ✅ Финальное исправление

## Текущий статус:
- ✅ Backend запущен и работает
- ✅ Nginx работает и делает редирект на HTTPS
- ⚠️ Нужно исправить trust proxy

## Исправление trust proxy

```bash
cd /var/www/vitrina/backend
nano src/app.js
```

Найдите строку:
```javascript
app.set('trust proxy', true);
```

Замените на:
```javascript
app.set('trust proxy', 1); // Доверяем только первому прокси (Nginx)
```

Сохраните и перезапустите:
```bash
pm2 restart vitrina-backend
```

## Проверка работы

```bash
# Проверить backend
curl http://localhost:3000/api/health
# Должно вернуть: {"status":"ok"}

# Проверить HTTPS
curl -I https://altdi.ru
# Должно вернуть: HTTP/1.1 200 OK

# Проверить HTTP (редирект)
curl -I http://altdi.ru
# Должно вернуть: HTTP/1.1 301 и Location: https://altdi.ru/
```

## Если сайт все еще не доступен извне

Проверьте настройки firewall в панели провайдера:
1. Войдите в панель управления VPS
2. Найдите раздел Firewall/Security
3. Откройте порты 80 и 443 для входящих подключений
4. Сохраните изменения

## Готово!

После исправления trust proxy сайт должен работать полностью.
