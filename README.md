# UsefulTips - Next.js + Prisma + Neon PostgreSQL

Минимальный рабочий проект на Next.js (App Router) с Prisma и NeonDB, готовый к деплою на Vercel.

## Технологии

- **Next.js 14** (App Router, TypeScript)
- **Prisma** (ORM)
- **NeonDB** (PostgreSQL)
- **Vercel** (деплой)

## Структура проекта

```
├── app/
│   ├── layout.tsx       # Корневой layout
│   ├── page.tsx         # Главная страница с чтением данных
│   └── globals.css      # Глобальные стили
├── lib/
│   └── prisma.ts        # Prisma client (singleton)
├── prisma/
│   ├── schema.prisma    # Схема базы данных
│   └── seed.ts          # Seed скрипт
├── .env.example         # Пример переменных окружения
└── package.json
```

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

1. Создайте проект на [Neon](https://neon.tech)
2. Скопируйте connection string из Neon dashboard
3. Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

4. Вставьте ваш connection string в `.env`:

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 3. Настройка Prisma

Сгенерируйте Prisma Client:

```bash
npm run db:generate
```

### 4. Миграция базы данных

Создайте и примените миграцию:

```bash
npm run db:migrate
```

### 5. Заполнение базы данных (seed)

```bash
npm run db:seed
```

### 6. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Деплой на Vercel

### 1. Подготовка репозитория

Убедитесь, что проект находится в Git репозитории:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Подключение к Vercel

1. Перейдите на [Vercel](https://vercel.com)
2. Импортируйте ваш Git репозиторий
3. В настройках проекта добавьте переменную окружения:

   - **Name**: `DATABASE_URL`
   - **Value**: ваш connection string из Neon

### 3. Настройка Build Command

Vercel автоматически обнаружит Next.js проект. Команда сборки уже настроена в `package.json`:

```json
"build": "prisma generate && next build"
```

### 4. Миграция на продакшене

После деплоя нужно применить миграции. В Vercel это можно сделать через:

**Вариант 1: Vercel CLI**
```bash
npm i -g vercel
vercel env pull .env.local
npx prisma migrate deploy
```

**Вариант 2: GitHub Actions / CI/CD**

Или добавьте postinstall скрипт в `package.json`:
```json
"postinstall": "prisma generate"
```

И примените миграции через Vercel CLI или вручную после первого деплоя.

### 5. Seed на продакшене (опционально)

Для заполнения базы данных на продакшене:

```bash
vercel env pull .env.local
npm run db:seed
```

## Модель данных

### Note

```prisma
model Note {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("notes")
}
```

## Команды

```bash
# Разработка
npm run dev              # Запуск dev сервера
npm run build            # Сборка для продакшена
npm run start            # Запуск продакшен сервера

# База данных
npm run db:generate      # Генерация Prisma Client
npm run db:migrate       # Создание и применение миграций
npm run db:seed          # Заполнение базы данных
npm run db:studio        # Открыть Prisma Studio
```

## Проверка работы

После деплоя главная страница должна:
1. ✅ Подключиться к базе данных Neon
2. ✅ Прочитать записи из таблицы `notes`
3. ✅ Отобразить их на странице

Если вы видите ошибку подключения, проверьте:
- Правильность `DATABASE_URL` в переменных окружения Vercel
- Что миграции применены к базе данных
- Что seed скрипт выполнен (если нужны тестовые данные)

## Дополнительная информация

- [Документация Next.js](https://nextjs.org/docs)
- [Документация Prisma](https://www.prisma.io/docs)
- [Документация Neon](https://neon.tech/docs)
- [Документация Vercel](https://vercel.com/docs)
