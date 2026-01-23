# Инструкция по развертыванию на Vercel

## Подготовка

### 1. Переменные окружения в Vercel

Убедитесь, что в настройках проекта Vercel добавлены следующие переменные окружения:

**Обязательные:**
- `DATABASE_URL` - строка подключения к PostgreSQL (Neon)
- `AUTH_SECRET` - секретный ключ для NextAuth (сгенерируйте через `openssl rand -base64 32`)
- `NEXTAUTH_URL` - URL вашего приложения на Vercel (например, `https://your-app.vercel.app`)
- `GOOGLE_CLIENT_ID` - Client ID из Google OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret из Google OAuth

### 2. Настройка Google OAuth

В Google Cloud Console добавьте Authorized redirect URI:
```
https://your-app.vercel.app/api/auth/callback/google
```

### 3. Миграции базы данных

После первого деплоя нужно применить миграции. Есть два способа:

**Вариант 1: Через Vercel CLI (рекомендуется)**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

**Вариант 2: Через Vercel Dashboard**
1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Убедитесь, что все переменные добавлены
4. Перейдите в Deployments
5. Выполните команду через Vercel CLI или используйте GitHub Actions

## Возможные проблемы

### Ошибка: "Prisma Client not generated"
**Решение:** Убедитесь, что в `package.json` есть скрипт `postinstall: "prisma generate"`

### Ошибка: "Environment variable not found"
**Решение:** Проверьте, что все переменные окружения добавлены в Vercel Dashboard

### Ошибка: "Migration failed"
**Решение:** Примените миграции вручную через `prisma migrate deploy`

### Ошибка: "NextAuth configuration error"
**Решение:** Убедитесь, что `AUTH_SECRET` и `NEXTAUTH_URL` правильно настроены

## Проверка после деплоя

1. Откройте ваш сайт на Vercel
2. Проверьте, что главная страница загружается
3. Попробуйте войти через Google OAuth
4. Проверьте защищенные маршруты (`/dashboard`, `/my-prompts`)

## Полезные команды

```bash
# Проверить статус миграций
npx prisma migrate status

# Применить миграции на продакшене
npx prisma migrate deploy

# Просмотреть логи Vercel
vercel logs
```

