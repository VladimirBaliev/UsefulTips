import { Pool, PoolConfig } from 'pg'
import { DbType, getDbConfig } from './db-config'
import { normalizeNeonUrl } from './db-url-helper'

// Кэш подключений
const pools: Map<DbType, Pool> = new Map()

function createPoolFromUrl(url: string): Pool {
  const isNeon = url.includes('neon.tech')
  const needsSSL = url.includes('sslmode=require') || isNeon

  // Очищаем URL от проблемных параметров для Neon
  let cleanUrl = url
  if (isNeon) {
    // Убираем channel_binding=require, который может вызывать проблемы с pooler
    cleanUrl = cleanUrl.replace(/[&?]channel_binding=require/g, '')
    // Убираем лишние параметры, которые могут мешать
    cleanUrl = cleanUrl.replace(/[&?]channel_binding=[^&]*/g, '')
    // Убеждаемся, что sslmode=require присутствует
    if (!cleanUrl.includes('sslmode=')) {
      cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'sslmode=require'
    }
    // Для pooler рекомендуется использовать pgbouncer=true
    if (cleanUrl.includes('-pooler') && !cleanUrl.includes('pgbouncer=')) {
      cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'pgbouncer=true'
    }
  }

  const poolConfig: PoolConfig = {
    connectionString: cleanUrl,
    ssl: needsSSL ? { 
      rejectUnauthorized: false,
      // Для Neon pooler иногда нужны дополнительные настройки
      ...(isNeon && {
        require: true,
      })
    } : undefined,
    // Настройки для стабильности подключения
    max: 10, // Максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000, // Закрывать неактивные клиенты через 30 секунд
    connectionTimeoutMillis: 20000, // Увеличиваем таймаут подключения
    // Для Neon рекомендуется использовать меньший пул
    ...(isNeon && {
      max: 3, // Меньший пул для Neon pooler
      idleTimeoutMillis: 10000, // Более короткий таймаут для Neon
      connectionTimeoutMillis: 30000, // Больше времени для установки соединения
      // Keep-alive для поддержания соединения
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }),
  }

  const pool = new Pool(poolConfig)

  // Обработка ошибок подключения
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
  })

  // Обработка отключений
  pool.on('connect', (client) => {
    client.on('error', (err) => {
      console.error('Database client error:', err)
    })
  })

  return pool
}

export function getDbPool(dbType: DbType): Pool {
  if (!pools.has(dbType)) {
    const config = getDbConfig(dbType)
    if (!config.url) {
      throw new Error(`Database URL not configured for ${dbType}`)
    }
    // Нормализуем URL для Neon (добавляем pooler если нужно)
    const normalizedUrl = normalizeNeonUrl(config.url)
    pools.set(dbType, createPoolFromUrl(normalizedUrl))
  }
  return pools.get(dbType)!
}

export async function testConnection(dbType: DbType): Promise<{ success: boolean; error?: string }> {
  let client: any = null
  try {
    const config = getDbConfig(dbType)
    if (!config.url || config.url.trim() === '') {
      return { 
        success: false, 
        error: `DATABASE_URL не настроен для ${dbType === 'local' ? 'локальной' : 'рабочей'} БД. Проверьте переменные окружения: ${dbType === 'local' ? 'DATABASE_URL_LOCAL или DATABASE_URL' : 'DATABASE_URL'}` 
      }
    }
    
    // Очищаем старый пул, если он был создан с неправильными настройками
    if (pools.has(dbType)) {
      try {
        await pools.get(dbType)!.end()
      } catch (e) {
        // Игнорируем ошибки при закрытии
      }
      pools.delete(dbType)
    }
    
    const pool = getDbPool(dbType)
    
    // Используем отдельный клиент для теста и явно закрываем его
    client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    client = null
    
    return { success: true }
  } catch (error: any) {
    // Освобождаем клиент в случае ошибки
    if (client) {
      try {
        client.release()
      } catch (e) {
        // Игнорируем ошибки при освобождении
      }
    }
    
    // Удаляем проблемный пул
    if (pools.has(dbType)) {
      try {
        await pools.get(dbType)!.end()
      } catch (e) {
        // Игнорируем ошибки
      }
      pools.delete(dbType)
    }
    
    if (error.message && error.message.includes('not configured')) {
      return { 
        success: false, 
        error: error.message 
      }
    }
    
    // Улучшенная обработка различных типов ошибок
    let errorMessage = error.message || 'Ошибка подключения к базе данных'
    
    if (error.code === 'ECONNRESET') {
      errorMessage = `Соединение было сброшено сервером.\n\nВозможные решения:\n1. Убедитесь, что используете pooler endpoint (URL должен содержать "-pooler")\n2. Проверьте, что URL не содержит channel_binding=require\n3. Попробуйте перезапустить приложение\n4. Проверьте настройки SSL в URL (sslmode=require)`
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      errorMessage = `Не удалось подключиться к серверу БД.\n\nПроверьте:\n- Правильность URL подключения\n- Доступность сервера\n- Настройки файрвола\n- Для Neon: убедитесь, что проект активен`
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = `Хост базы данных не найден.\n\nПроверьте правильность URL подключения.`
    } else if (error.message && error.message.includes('SSL')) {
      errorMessage = `Ошибка SSL соединения.\n\nПопробуйте:\n- Убедитесь, что URL содержит sslmode=require\n- Для Neon используйте pooler endpoint`
    }
    
    return { success: false, error: errorMessage }
  }
}

export async function closeAllConnections() {
  await Promise.all(Array.from(pools.values()).map(pool => pool.end()))
  pools.clear()
}

