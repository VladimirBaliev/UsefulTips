# Настройка аутентификации через Google OAuth

## Шаги настройки

### 1. Установите зависимости

```bash
npm install next-auth@beta @auth/prisma-adapter --legacy-peer-deps
```

Если возникают проблемы с сетью, попробуйте:
```bash
npm install next-auth@beta @auth/prisma-adapter --legacy-peer-deps --registry https://registry.npmjs.org/
```

### 2. Настройте Google OAuth в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API:
   - Перейдите в "APIs & Services" → "Library"
   - Найдите "Google+ API" и нажмите "Enable"
4. Создайте OAuth 2.0 Client ID:
   - Перейдите в "APIs & Services" → "Credentials"
   - Нажмите "Create Credentials" → "OAuth client ID"
   - Если появится запрос, настройте OAuth consent screen:
     - Выберите "External" (для тестирования) или "Internal" (для G Suite)
     - Заполните обязательные поля
   - Выберите тип приложения: "Web application"
   - Добавьте Authorized redirect URIs:
     - Для разработки: `http://localhost:3000/api/auth/callback/google`
     - Для продакшена: `https://yourdomain.com/api/auth/callback/google`
   - Нажмите "Create"
5. Скопируйте Client ID и Client Secret

### 3. Настройте переменные окружения

Добавьте в файл `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Auth.js Secret (сгенерируйте случайную строку)
AUTH_SECRET="your-random-secret-key"

# Next.js URL (для продакшена)
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Сгенерируйте AUTH_SECRET

Выполните одну из команд:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Или используйте онлайн генератор:**
- https://generate-secret.vercel.app/32

### 5. Примените миграции базы данных

Миграции создадут необходимые таблицы для аутентификации:

```bash
npm run db:migrate
```

Это создаст таблицы:
- `accounts` - для хранения OAuth аккаунтов
- `sessions` - для хранения сессий пользователей
- `verification_tokens` - для верификации email (если нужно)
- Обновит таблицу `users` (добавит поля `emailVerified`, `image`)

### 6. Перезапустите dev сервер

```bash
npm run dev
```

### 7. Проверьте работу

1. Откройте http://localhost:3000/login
2. Нажмите "Войти через Google"
3. Авторизуйтесь через Google
4. Вы должны быть перенаправлены на `/dashboard`

## Защищенные маршруты

Следующие маршруты защищены middleware и требуют аутентификации:
- `/dashboard` - панель управления
- `/my-prompts` - список промтов пользователя

Неавторизованные пользователи будут перенаправлены на `/login`.

## Использование в коде

### Server-side (Server Components, API Routes)

```typescript
import { getCurrentUser, getUserId, requireAuth } from '@/lib/auth-server'

// Получить текущего пользователя
const user = await getCurrentUser()

// Получить только userId
const userId = await getUserId()

// Требовать аутентификацию (выбросит ошибку если не авторизован)
const userId = await requireAuth()
```

### Client-side

```typescript
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') return <button onClick={() => signIn()}>Sign in</button>
  
  return (
    <div>
      <p>Signed in as {session?.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

## Troubleshooting

### Ошибка: "Invalid credentials"
- Проверьте, что GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET правильно скопированы
- Убедитесь, что redirect URI в Google Console совпадает с NEXTAUTH_URL

### Ошибка: "AUTH_SECRET is missing"
- Убедитесь, что AUTH_SECRET добавлен в `.env`
- Перезапустите dev сервер после добавления

### Ошибка при миграции
- Убедитесь, что DATABASE_URL настроен
- Проверьте, что база данных доступна
- Попробуйте: `npm run db:generate` перед миграцией

### Сессии не сохраняются
- Проверьте, что миграции применены
- Убедитесь, что используется `strategy: 'database'` в authOptions
- Проверьте подключение к базе данных

