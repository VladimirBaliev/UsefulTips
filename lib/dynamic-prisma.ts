import { PrismaClient } from '@prisma/client'
import { DbType } from './db-config'

// Кэш для разных подключений
const prismaClients: Map<string, PrismaClient> = new Map()

export function getPrismaClient(dbType: DbType): PrismaClient {
  const cacheKey = dbType

  if (!prismaClients.has(cacheKey)) {
    // Импортируем переменные окружения
    const { PrismaClient } = require('@prisma/client')
    
    // Для динамического подключения нужно передать DATABASE_URL через datasource
    // Но так как Prisma Client уже сгенерирован, мы используем текущий URL
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })

    prismaClients.set(cacheKey, client)
  }

  return prismaClients.get(cacheKey)!
}

export async function disconnectAll() {
  await Promise.all(Array.from(prismaClients.values()).map(client => client.$disconnect()))
  prismaClients.clear()
}


