import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import type { NextAuthConfig } from 'next-auth'

// Автоматическое определение URL для продакшена и разработки
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://your-app.vercel.app' // Замените на ваш URL
    : 'http://localhost:3000'
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, user }: any) {
      if (session?.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  session: {
    strategy: 'database',
  },
  trustHost: true, // Для Next.js 16+
}

// Проверка обязательных переменных окружения
if (!process.env.AUTH_SECRET) {
  console.warn('⚠️  AUTH_SECRET не установлен. Сгенерируйте его: openssl rand -base64 32')
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET не установлены. Настройте Google OAuth.')
}

