import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

/**
 * Получить текущего пользователя на сервере
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }
  return session.user
}

/**
 * Получить userId текущего пользователя
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Проверить, авторизован ли пользователь
 */
export async function requireAuth() {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

/**
 * Получить пользователя из базы данных по ID
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  })
}

