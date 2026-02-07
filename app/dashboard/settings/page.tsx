import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Личный кабинет</h1>
          <h2 className="text-xl text-gray-600">Настройки</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Настройки будут доступны в ближайшее время</p>
        </div>
      </div>
    </div>
  )
}





