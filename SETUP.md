# Настройка подключения к базе данных

## Проблема: Ошибка подключения к базе данных

Если вы видите ошибку "Ошибка подключения к базе данных", это означает, что не настроены переменные окружения.

## Решение

### 1. Создайте файл `.env` в корне проекта

Создайте файл `.env` (обратите внимание на точку в начале имени файла) в корневой директории проекта.

### 2. Добавьте переменные окружения

Откройте файл `.env` и добавьте следующие переменные:

```env
# База данных - Рабочая БД
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# База данных - Локальная БД (опционально)
# Если не указано, будет использоваться DATABASE_URL
# DATABASE_URL_LOCAL="postgresql://user:password@localhost:5432/localdb"

# Auth.js - Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Auth.js - Secret для шифрования сессий
# Сгенерируйте случайную строку: openssl rand -base64 32
AUTH_SECRET="your-random-secret-key"

# Next.js - URL приложения (для продакшена)
# NEXTAUTH_URL="https://yourdomain.com"
```

### 3. Настройте Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 Client ID:
   - Перейдите в "Credentials" → "Create Credentials" → "OAuth client ID"
   - Выберите "Web application"
   - Добавьте Authorized redirect URIs:
     - Для разработки: `http://localhost:3000/api/auth/callback/google`
     - Для продакшена: `https://yourdomain.com/api/auth/callback/google`
5. Скопируйте Client ID и Client Secret
6. Добавьте их в `.env` файл

### 4. Сгенерируйте AUTH_SECRET

Выполните команду для генерации случайного секрета:
```bash
openssl rand -base64 32
```

Или используйте любой генератор случайных строк. Добавьте результат в `.env` как `AUTH_SECRET`.

### 5. Получите строку подключения к БД

#### Для Neon (рекомендуется)
1. Зайдите на [Neon](https://neon.tech)
2. Создайте проект (если еще не создан)
3. Скопируйте connection string из Dashboard
4. Вставьте его в `.env` файл как значение `DATABASE_URL`

#### Для локальной PostgreSQL
Если у вас установлен PostgreSQL локально:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
```

### 6. Примените миграции базы данных

После настройки переменных окружения нужно применить миграции для создания таблиц аутентификации:

```bash
npm run db:migrate
```

Это создаст таблицы: `accounts`, `sessions`, `verification_tokens` и обновит таблицу `users`.

### 7. Перезапустите dev сервер

После создания файла `.env`:
1. Остановите dev сервер (если запущен)
2. Запустите снова: `npm run dev`

## Проверка подключения

После настройки откройте http://localhost:3000/view-db и проверьте статус подключения для каждой БД.

## Примечания

- Файл `.env` должен находиться в корне проекта (там же, где `package.json`)
- **Не коммитьте** файл `.env` в Git (он уже добавлен в `.gitignore`)
- Переменные окружения читаются автоматически Next.js при запуске
- Если указан `DATABASE_URL_LOCAL`, он будет использоваться для локальной БД, иначе используется `DATABASE_URL`



