# 💾 Информация о резервных копиях

## Созданные резервные копии

### 1. Git Tag (в репозитории)
Создан тег для текущего состояния проекта. Теги отправлены в удаленный репозиторий.

Просмотр тегов:
```bash
git tag -l
```

Восстановление из тега:
```bash
git checkout <tag-name>
```

### 2. Git Bundle (локальный файл)
Создан bundle файл со всей историей Git:
- `vitrina-backup-YYYYMMDD.bundle`

Восстановление из bundle:
```bash
git clone vitrina-backup-YYYYMMDD.bundle vitrina-restored
```

### 3. Архив проекта (tar.gz)
Создан архив всех файлов проекта (без node_modules и БД):
- `vitrina-backup-YYYYMMDD.tar.gz`

Восстановление из архива:
```bash
tar -xzf vitrina-backup-YYYYMMDD.tar.gz
```

## Рекомендации по хранению

1. **Git Bundle** - храните в безопасном месте (облако, внешний диск)
2. **Архив проекта** - можно использовать для быстрого восстановления
3. **Git Tag** - уже в удаленном репозитории GitHub

## Автоматическое создание бэкапов

Для автоматического создания бэкапов можно добавить в cron:

```bash
# Ежедневный бэкап в 3:00
0 3 * * * cd /path/to/project && git bundle create backups/vitrina-backup-$(date +\%Y\%m\%d).bundle --all
```

## Восстановление проекта

### Из Git Bundle:
```bash
git clone vitrina-backup-YYYYMMDD.bundle vitrina-restored
cd vitrina-restored
```

### Из архива:
```bash
tar -xzf vitrina-backup-YYYYMMDD.tar.gz
cd vitrina
```

### Из Git Tag:
```bash
git clone <repository-url>
cd vitrina
git checkout <tag-name>
```

## Важные файлы для бэкапа

✅ Включены в бэкап:
- Весь исходный код
- Конфигурационные файлы
- Документация
- Скрипты деплоя

❌ Исключены из бэкапа:
- `node_modules/` (можно восстановить через `npm install`)
- `database.sqlite` (нужно бэкапить отдельно)
- `.env` (секретные данные, не должны быть в Git)

## Бэкап базы данных

Для бэкапа БД отдельно:
```bash
cp /var/www/vitrina/backend/database.sqlite \
  /backups/database_$(date +%Y%m%d_%H%M%S).sqlite
```
