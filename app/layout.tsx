import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UsefulTips - Next.js + Prisma + Neon',
  description: 'Minimal Next.js project with Prisma and Neon PostgreSQL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}









