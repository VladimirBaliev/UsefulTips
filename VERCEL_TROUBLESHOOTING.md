# Решение проблем с развертыванием на Vercel

## Ошибка: "Application error: a server-side exception has occurred"

Эта ошибка обычно возникает из-за проблем с:
1. Подключением к базе данных
2. Отсутствующими переменными окружения
3. Непримененными миграциями
4. Проблемами с Prisma Client

## Пошаговая диагностика

### 1. Проверьте переменные окружения в Vercel

В Vercel Dashboard → Settings → Environment Variables должны быть:

**Обязательные:**
- `DATABASE_URL` - строка подключения к PostgreSQL (Neon)
- `AUTH_SECRET` - секретный ключ для NextAuth
- `NEXTAUTH_URL` - URL вашего приложения (например, `https://your-app.vercel.app`)
- `GOOGLE_CLIENT_ID` - Client ID из Google OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret из Google OAuth

**Важно:** После добавления переменных нужно пересобрать проект!

### 2. Проверьте логи Vercel

1. Откройте Vercel Dashboard
2. Перейдите в Deployments
3. Выберите последний деплой
4. Откройте "Function Logs" или "Build Logs"

Ищите ошибки типа:
- `Environment variable not found`
- `Can't reach database server`
- `Prisma Client not generated`
- `Table does not exist`

### 3. Примените миграции

После первого деплоя нужно применить миграции:

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Подключите проект
vercel link

# Получите переменные окружения
vercel env pull .env.local

# Примените миграции
npx prisma migrate deploy
```

### 4. Проверьте подключение к базе данных

Убедитесь, что:
- DATABASE_URL правильный и актуальный
- База данных доступна из интернета (Neon по умолчанию доступна)
- SSL режим включен (`?sslmode=require`)

### 5. Проверьте Prisma Client

Убедитесь, что в `package.json` есть:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Это гарантирует, что Prisma Client будет сгенерирован при установке зависимостей.

## Частые проблемы и решения

### Проблема: "Prisma Client not generated"

**Решение:**
1. Убедитесь, что `postinstall`` скрипт есть в `package.json`
2. Проверьте, что `prisma` в `devDependencies`
3. Пересоберите проект в Vercel

### Проблема: "Table does not exist"

**Решение:**
Примените миграции:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Проблема: "Can't reach database server"

**Решение:**
1. Проверьте DATABASE_URL в Vercel
2. Убедитесь, что база данных Neon активна
3. Проверьте, что connection string правильный (включает `?sslmode=require`)

### Проблема: "Environment variable not found"

**Решение:**
1. Проверьте все переменные в Vercel Dashboard
2. Убедитесь, что они добавлены для правильного окружения (Production, Preview, Development)
3. После добавления пересоберите проект

### Проблема: "NextAuth configuration error"

**Решение:**
1. Проверьте `AUTH_SECRET` - должен быть длинной случайной строкой
2. Проверьте `NEXTAUTH_URL` - должен совпадать с URL вашего приложения
3. Проверьте Google OAuth credentials

## Проверка после исправления

1. Откройте ваш сайт на Vercel
2. Проверьте главную страницу - должна загрузиться
3. Попробуйте войти через Google
4. Проверьте защищенные маршруты (`/dashboard`)

## Получение подробных логов

Если проблема не решена, включите подробное логирование:

1. В Vercel Dashboard → Settings → Environment Variables
2. Добавьте: `NODE_ENV=production`
3. Пересоберите проект

Или используйте Vercel CLI для просмотра логов в реальном времени:

```bash
vercel logs --follow
```

## Полезные команды

```bash
# Проверить статус миграций
npx prisma migrate status

# Применить миграции на продакшене
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate

# Просмотреть логи Vercel
vercel logs

# Пересобрать проект локально
npm run build
```

