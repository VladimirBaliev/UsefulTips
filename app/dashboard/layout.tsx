import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Форматируем имя пользователя
  const userName = user.name || user.email?.split('@')[0] || 'Пользователь'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar userName={userName} userImage={user.image} />
      <main className="flex-1 bg-white">
        {children}
      </main>
    </div>
  )
}





