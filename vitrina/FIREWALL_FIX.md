# 🔥 Исправление Firewall без UFW

## UFW не установлен - используем iptables

### 1. Проверить текущие правила iptables

```bash
# Посмотреть все правила
sudo iptables -L -n -v

# Посмотреть правила INPUT
sudo iptables -L INPUT -n -v --line-numbers
```

### 2. Открыть порты через iptables

```bash
# Разрешить HTTP (порт 80)
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT

# Разрешить HTTPS (порт 443)
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT

# Разрешить SSH (порт 22) - если еще не разрешен
sudo iptables -I INPUT -p tcp --dport 22 -j ACCEPT

# Сохранить правила
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### 3. Установить iptables-persistent (чтобы правила сохранялись после перезагрузки)

```bash
sudo apt update
sudo apt install -y iptables-persistent

# При установке спросит сохранить текущие правила - ответьте "Yes"
```

### 4. Проверить правила

```bash
# Проверить, что порты открыты
sudo iptables -L INPUT -n -v | grep -E "80|443|22"

# Должны быть правила ACCEPT для портов 80, 443, 22
```

## Альтернатива: Установить UFW

Если хотите использовать UFW (проще в управлении):

```bash
# Установить UFW
sudo apt update
sudo apt install -y ufw

# Открыть порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status verbose
```

## Проверка панели провайдера

Если используете VPS/облако, проверьте настройки firewall в панели провайдера:

1. **DigitalOcean**: Networking → Firewalls
2. **AWS**: Security Groups
3. **Hetzner**: Firewall в панели управления
4. **Timeweb, REG.RU и т.д.**: Настройки безопасности сервера

Откройте порты 80 и 443 для входящих подключений.

## Проверка после исправления

```bash
# Проверить правила iptables
sudo iptables -L INPUT -n -v

# Проверить, что порты слушают на всех интерфейсах
sudo netstat -tulpn | grep -E "80|443"

# Должно быть:
# tcp  0.0.0.0:80    LISTEN
# tcp  0.0.0.0:443   LISTEN
```

## Тестирование извне

После открытия портов проверьте доступность:

```bash
# С вашего компьютера (не с сервера!)
curl -I http://188.215.31.206
curl -I https://altdi.ru

# Или используйте онлайн сервисы:
# https://www.yougetsignal.com/tools/open-ports/
# https://canyouseeme.org/
```
