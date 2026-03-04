# 🔧 Быстрое исправление schema.prisma на сервере

## Проблема
SQLite не поддерживает enum в Prisma. Нужно заменить enum Role на String.

## Решение

Выполните на сервере:

```bash
cd /var/www/vitrina/backend
nano prisma/schema.prisma
```

### Шаг 1: Удалите enum Role (строки 13-17)

Найдите и **удалите** эти строки:
```prisma
enum Role {
  User
  Master
  Admin
}
```

### Шаг 2: Измените поле role в модели User

Найдите строку:
```prisma
role         Role      @default(User)
```

И замените на:
```prisma
role         String    @default("User") // User, Master, Admin
```

### Шаг 3: Сохраните файл
- Нажмите `Ctrl+O` (сохранить)
- Нажмите `Enter` (подтвердить)
- Нажмите `Ctrl+X` (выйти)

### Шаг 4: Примените изменения

```bash
# Перегенерировать Prisma клиент
npx prisma generate

# Если база данных уже существует, используйте db push
npx prisma db push

# Или создайте новую миграцию (если БД пустая)
npx prisma migrate dev --name fix_role_enum
```

### Шаг 5: Перезапустите backend

```bash
pm2 start src/app.js --name vitrina-backend
pm2 save
```

## Полный файл schema.prisma должен выглядеть так:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           Int       @id @default(autoincrement())
  fio          String
  passwordHash String    @map("password_hash")
  role         String    @default("User") // User, Master, Admin
  telegramId   String?   @map("telegram_id")
  verified     Boolean   @default(false)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  products     Product[]
  
  @@map("users")
}

model Product {
  id           Int      @id @default(autoincrement())
  masterId     Int      @map("master_id")
  title        String
  description  String
  price        Float
  images       String   // JSON array as string
  category     String
  material     String
  priorityLevel Int     @default(0) @map("priority_level")
  sizeBoost    Int      @default(0) @map("size_boost")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  master       User     @relation(fields: [masterId], references: [id], onDelete: Cascade)
  
  @@map("products")
}
```

## Альтернатива: Скопировать правильный файл

Если хотите скопировать готовый файл:

```bash
cd /var/www/vitrina/backend
cat > prisma/schema.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           Int       @id @default(autoincrement())
  fio          String
  passwordHash String    @map("password_hash")
  role         String    @default("User") // User, Master, Admin
  telegramId   String?   @map("telegram_id")
  verified     Boolean   @default(false)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  products     Product[]
  
  @@map("users")
}

model Product {
  id           Int      @id @default(autoincrement())
  masterId     Int      @map("master_id")
  title        String
  description  String
  price        Float
  images       String   // JSON array as string
  category     String
  material     String
  priorityLevel Int     @default(0) @map("priority_level")
  sizeBoost    Int      @default(0) @map("size_boost")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  master       User     @relation(fields: [masterId], references: [id], onDelete: Cascade)
  
  @@map("products")
}
EOF

# Затем примените изменения
npx prisma generate
npx prisma db push
pm2 start src/app.js --name vitrina-backend
pm2 save
```
