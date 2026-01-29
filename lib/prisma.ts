import { PrismaClient } from '@prisma/client'
import { normalizeNeonUrl } from './db-url-helper'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Нормализуем DATABASE_URL для Neon (добавляем pgbouncer=true и правильные SSL параметры)
// Это нужно сделать ДО создания PrismaClient, чтобы он использовал правильный URL
function getNormalizedDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  const normalized = normalizeNeonUrl(dbUrl)
  
  // Логируем нормализованный URL в development для отладки
  if (process.env.NODE_ENV === 'development') {
    if (dbUrl !== normalized) {
      console.log('[Prisma] Нормализация DATABASE_URL для Neon pooler')
      console.log('[Prisma] Оригинальный:', dbUrl.replace(/:[^:@]+@/, ':****@'))
      console.log('[Prisma] Нормализованный:', normalized.replace(/:[^:@]+@/, ':****@'))
    } else {
      console.log('[Prisma] DATABASE_URL уже нормализован')
    }
  }
  
  return normalized
}

// Получаем нормализованный URL
const normalizedUrl = getNormalizedDatabaseUrl()

// КРИТИЧЕСКИ ВАЖНО: Обновляем process.env.DATABASE_URL ДО создания PrismaClient
// Prisma Client читает URL из переменных окружения при инициализации
// Это гарантирует, что Prisma будет использовать нормализованный URL с pgbouncer=true
process.env.DATABASE_URL = normalizedUrl

// Определяем, является ли это Neon pooler подключением
const isNeonPooler = normalizedUrl.includes('neon.tech') && normalizedUrl.includes('-pooler')

// Создаем PrismaClient
// Prisma будет использовать DATABASE_URL из process.env, который мы только что обновили
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma










