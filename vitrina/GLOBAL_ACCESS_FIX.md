# 🌍 Исправление глобальной доступности сайта

## Проблема: Сайт доступен только из России

Сайт работает из России (HTTP 200), но недоступен из других стран (таймаут).

## Причины и решения

### 1. Firewall блокирует внешние подключения

```bash
# Проверить статус firewall
sudo ufw status verbose

# Если firewall активен, открыть порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw reload

# Проверить правила
sudo ufw status numbered
```

### 2. Проверка iptables (если используется)

```bash
# Проверить правила iptables
sudo iptables -L -n -v

# Если есть блокирующие правила, разрешить порты
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### 3. Проверка конфигурации Nginx

```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить, что Nginx слушает на всех интерфейсах
sudo netstat -tulpn | grep nginx
```

Должно быть:
```
tcp  0.0.0.0:80    LISTEN  nginx
tcp  0.0.0.0:443   LISTEN  nginx
```

Если слушает только на 127.0.0.1 - это проблема!

### 4. Проверка DNS

```bash
# Проверить DNS с разных локаций
dig altdi.ru +short @8.8.8.8
dig altdi.ru +short @1.1.1.1

# Должно вернуть: 188.215.31.206
```

### 5. Проверка доступности портов извне

```bash
# С вашего компьютера (не с сервера!)
telnet 188.215.31.206 80
telnet 188.215.31.206 443

# Или
nc -zv 188.215.31.206 80
nc -zv 188.215.31.206 443
```

## Полное исправление

### Шаг 1: Открыть порты в Firewall

```bash
# Проверить статус
sudo ufw status

# Открыть порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw reload

# Проверить
sudo ufw status verbose
```

### Шаг 2: Проверить iptables

```bash
# Посмотреть правила
sudo iptables -L INPUT -n -v --line-numbers

# Если нужно, разрешить порты
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
```

### Шаг 3: Проверить конфигурацию Nginx

```bash
sudo cat /etc/nginx/sites-available/vitrina | grep listen
```

Должно быть:
- `listen 80;` (или `listen 0.0.0.0:80;`)
- `listen 443 ssl;` (или `listen 0.0.0.0:443 ssl;`)

НЕ должно быть:
- `listen 127.0.0.1:80;` (только локальный доступ)

### Шаг 4: Перезапустить Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Шаг 5: Проверить извне

```bash
# С сервера проверить локально
curl -I http://localhost
curl -I https://localhost

# Должно вернуть HTTP 200
```

## Проверка доступности

### Онлайн сервисы для проверки:

1. **https://downforeveryoneorjustme.com/** - проверка доступности
2. **https://www.isitdownrightnow.com/** - статус сайта
3. **https://dnschecker.org/** - проверка DNS

### С разных локаций:

```bash
# Используйте онлайн сервисы или VPN для проверки
```

## Если проблема в провайдере

Некоторые провайдеры блокируют входящие подключения. Проверьте:

1. **Настройки безопасности в панели провайдера**
2. **DDoS защита** - может блокировать легитимный трафик
3. **Географические ограничения** - если включены

## Альтернатива: Использовать Cloudflare

Если проблемы с доступностью продолжаются, можно использовать Cloudflare:

1. Зарегистрироваться на Cloudflare
2. Добавить домен altdi.ru
3. Настроить DNS записи
4. Включить проксирование через Cloudflare

Это решит проблемы с доступностью из разных стран.

## Проверка после исправления

```bash
# 1. Проверить firewall
sudo ufw status

# 2. Проверить порты
sudo netstat -tulpn | grep -E "80|443"

# 3. Проверить Nginx
sudo systemctl status nginx
sudo nginx -t

# 4. Проверить логи
sudo tail -f /var/log/nginx/access.log
```
