export type DbType = 'local' | 'remote'

export interface DbConfig {
  type: DbType
  name: string
  url: string
}

export const dbConfigs: Record<DbType, DbConfig> = {
  local: {
    type: 'local',
    name: 'Локальная БД',
    url: process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL || '',
  },
  remote: {
    type: 'remote',
    name: 'Рабочая БД',
    url: process.env.DATABASE_URL || '',
  },
}

export function getDbConfig(type: DbType): DbConfig {
  return dbConfigs[type]
}


