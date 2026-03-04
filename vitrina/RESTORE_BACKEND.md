# Восстановление бэкенда после ошибки 502

Выполните эти команды на сервере:

```bash
cd /var/www/vitrina/backend

# 1. Проверить статус
pm2 status

# 2. Если процесс упал, проверить логи
pm2 logs vitrina-backend --err --lines 50

# 3. Если есть резервная копия, восстановить
if [ -f src/controllers/productController.js.bak ]; then
  cp src/controllers/productController.js.bak src/controllers/productController.js
  echo "✅ Восстановлен из резервной копии"
fi

# 4. Проверить синтаксис
node -c src/controllers/productController.js || echo "❌ Синтаксическая ошибка!"

# 5. Перезапустить
pm2 restart vitrina-backend

# 6. Проверить здоровье
sleep 2
curl http://localhost:3000/api/health
```

Если файл поврежден, используйте полную версию из репозитория или восстановите вручную.
