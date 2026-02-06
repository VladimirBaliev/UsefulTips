'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Star, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  userName: string
  userImage?: string | null
}

export function DashboardSidebar({ userName, userImage }: DashboardSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Советы',
      icon: MessageSquare,
      active: pathname === '/dashboard',
    },
    {
      href: '/dashboard/favorites',
      label: 'Избранное',
      icon: Star,
      active: pathname === '/dashboard/favorites',
    },
    {
      href: '/dashboard/history',
      label: 'История',
      icon: History,
      active: pathname === '/dashboard/history',
    },
    {
      href: '/dashboard/settings',
      label: 'Настройки',
      icon: Settings,
      active: pathname === '/dashboard/settings',
    },
  ]

  // Форматируем имя: берем первые буквы имени и фамилии
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <aside className="w-[280px] min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6 flex flex-col">
      {/* Аватар и имя */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              {getInitials(userName)}
            </div>
          )}
        </div>
        <p className="text-gray-700 font-medium text-sm ml-1">
          {userName}
        </p>
      </div>

      {/* Меню */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    'text-gray-700 hover:bg-blue-200/50',
                    item.active && 'bg-white shadow-sm font-medium text-blue-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}




