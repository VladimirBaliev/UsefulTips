import { Pool } from 'pg'
import { DbType, getDbConfig } from './db-config'

// Кэш подключений
const pools: Map<DbType, Pool> = new Map()

function createPoolFromUrl(url: string): Pool {
  return new Pool({
    connectionString: url,
    ssl: url.includes('sslmode=require') || url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  })
}

export function getDbPool(dbType: DbType): Pool {
  if (!pools.has(dbType)) {
    const config = getDbConfig(dbType)
    if (!config.url) {
      throw new Error(`Database URL not configured for ${dbType}`)
    }
    pools.set(dbType, createPoolFromUrl(config.url))
  }
  return pools.get(dbType)!
}

export async function testConnection(dbType: DbType): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getDbConfig(dbType)
    if (!config.url || config.url.trim() === '') {
      return { 
        success: false, 
        error: `DATABASE_URL не настроен для ${dbType === 'local' ? 'локальной' : 'рабочей'} БД. Проверьте переменные окружения: ${dbType === 'local' ? 'DATABASE_URL_LOCAL или DATABASE_URL' : 'DATABASE_URL'}` 
      }
    }
    const pool = getDbPool(dbType)
    await pool.query('SELECT 1')
    return { success: true }
  } catch (error: any) {
    if (error.message && error.message.includes('not configured')) {
      return { 
        success: false, 
        error: error.message 
      }
    }
    return { success: false, error: error.message || 'Ошибка подключения к базе данных' }
  }
}

export async function closeAllConnections() {
  await Promise.all(Array.from(pools.values()).map(pool => pool.end()))
  pools.clear()
}

