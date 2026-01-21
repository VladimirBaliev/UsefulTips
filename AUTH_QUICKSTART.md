# Быстрый старт: Настройка аутентификации

## Что было сделано

✅ Настроен Auth.js (NextAuth) с Google OAuth провайдером
✅ Обновлена Prisma schema для поддержки аутентификации
✅ Созданы API routes для аутентификации
✅ Создана страница входа `/login`
✅ Настроен middleware для защиты маршрутов
✅ Созданы server-side утилиты для работы с пользователями
✅ Созданы страницы `/dashboard` и `/my-prompts`

## Что нужно сделать

### 1. Установите зависимости

```bash
npm install next-auth@beta @auth/prisma-adapter --legacy-peer-deps
```

Если возникают проблемы с сетью, попробуйте несколько раз или используйте другой регистр.

### 2. Настройте Google OAuth

1. Перейдите на https://console.cloud.google.com/
2. Создайте OAuth 2.0 Client ID
3. Добавьте redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Скопируйте Client ID и Client Secret

### 3. Добавьте переменные в `.env`

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
AUTH_SECRET="generate-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

Для генерации AUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Примените миграции

```bash
npm run db:migrate
```

Это создаст таблицы для аутентификации.

### 5. Перезапустите сервер

```bash
npm run dev
```

### 6. Проверьте работу

Откройте http://localhost:3000/login и войдите через Google.

## Структура файлов

- `lib/auth.ts` - конфигурация Auth.js
- `lib/auth-server.ts` - server-side утилиты (getCurrentUser, getUserId, requireAuth)
- `app/api/auth/[...nextauth]/route.ts` - API routes для аутентификации
- `app/login/page.tsx` - страница входа
- `app/dashboard/page.tsx` - защищенная страница панели управления
- `app/my-prompts/page.tsx` - защищенная страница с промтами пользователя
- `middleware.ts` - защита маршрутов
- `types/next-auth.d.ts` - типы TypeScript для NextAuth

## Использование

### В Server Components:

```typescript
import { getCurrentUser } from '@/lib/auth-server'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return <div>Hello {user.name}</div>
}
```

### В Client Components:

```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function Component() {
  const { data: session } = useSession()
  return <div>Hello {session?.user?.name}</div>
}
```

Подробная документация: см. `AUTH_SETUP.md`

