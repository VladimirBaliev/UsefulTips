import { prisma } from './prisma'
import { cookies } from 'next/headers'

/**
 * Получить текущего пользователя на сервере
 * Для NextAuth v5 с database sessions получаем сессию через cookies
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  
  // Пробуем разные варианты имени cookie для session token
  const sessionToken = 
    cookieStore.get('next-auth.session-token')?.value || 
    cookieStore.get('__Secure-next-auth.session-token')?.value ||
    cookieStore.get('authjs.session-token')?.value ||
    cookieStore.get('__Secure-authjs.session-token')?.value
  
  if (!sessionToken) {
    return null
  }
  
  // Получаем сессию из базы данных
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  })
  
  if (!session || !session.user || new Date(session.expires) < new Date()) {
    return null
  }
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  }
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


