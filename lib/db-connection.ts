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
    const pool = getDbPool(dbType)
    await pool.query('SELECT 1')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function closeAllConnections() {
  await Promise.all(Array.from(pools.values()).map(pool => pool.end()))
  pools.clear()
}

