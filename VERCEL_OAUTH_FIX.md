  # Исправление ошибки OAuth на Vercel

## Проблема: "connectionfailure" при авторизации через Google

Эта ошибка возникает из-за неправильной настройки переменных окружения или redirect URI в Google OAuth.

## Решение

### 1. Добавьте переменные окружения в Vercel

В Vercel Dashboard → Settings → Environment Variables добавьте:

**Обязательные переменные:**
```
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
```

**Важно:** 
- Замените `your-app.vercel.app` на реальный URL вашего приложения на Vercel
- После добавления переменных **пересоберите проект** (Redeploy)

### 2. Настройте Google OAuth Redirect URI

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Откройте ваш проект
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите ваш OAuth 2.0 Client ID и нажмите **Edit**
5. В разделе **Authorized redirect URIs** добавьте:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
   (Замените `your-app.vercel.app` на ваш реальный URL)
6. Сохраните изменения

**Важно:** Убедитесь, что redirect URI точно совпадает с URL вашего приложения на Vercel!

### 3. Проверьте переменную NEXTAUTH_URL

В Vercel Dashboard проверьте, что `NEXTAUTH_URL` установлен правильно:
- Должен начинаться с `https://`
- Не должен заканчиваться на `/`
- Должен совпадать с URL вашего приложения

Пример правильного значения:
```
https://usefultips.vercel.app
```

### 4. Примените миграции базы данных

Если миграции еще не применены:

```bash
# Войдите в аккаунт (используйте npx, не требует глобальной установки)
npx vercel login

# Подключите проект
npx vercel link

# Получите переменные окружения
npx vercel env pull .env.local

# Примените миграции
npx prisma migrate deploy
```

**Альтернатива:** Если хотите установить Vercel CLI глобально:
```bash
npm install -g vercel
# Затем перезапустите PowerShell/терминал
vercel login
```

### 5. Пересоберите проект

После изменения переменных окружения:
1. Откройте Vercel Dashboard
2. Перейдите в **Deployments**
3. Нажмите **Redeploy** на последнем деплое
4. Или сделайте новый commit и push в репозиторий

## Проверка работы

1. Откройте ваш сайт на Vercel
2. Перейдите на страницу `/login`
3. Нажмите "Войти через Google"
4. Должно произойти перенаправление на Google для авторизации
5. После авторизации вы должны вернуться на ваш сайт

## Частые ошибки

### Ошибка: "redirect_uri_mismatch"
**Причина:** Redirect URI в Google OAuth не совпадает с URL приложения
**Решение:** Проверьте, что в Google Cloud Console добавлен правильный redirect URI

### Ошибка: "connectionfailure"
**Причина:** 
- Отсутствует `NEXTAUTH_URL` в переменных окружения
- Неправильный формат `NEXTAUTH_URL`
- Проблемы с подключением к базе данных

**Решение:**
1. Проверьте переменные окружения в Vercel
2. Убедитесь, что `NEXTAUTH_URL` начинается с `https://`
3. Проверьте подключение к базе данных

### Ошибка: "Application error"
**Причина:** Непримененные миграции или проблемы с Prisma
**Решение:** Примените миграции (см. шаг 4)

## Дополнительная информация

- [Документация NextAuth.js](https://next-auth.js.org/configuration/options)
- [Документация Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

