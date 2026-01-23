import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Панель управления</h1>
        <p style={{ color: '#666' }}>
          Добро пожаловать, {user.name || user.email}!
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Link
          href="/my-prompts"
          style={{
            padding: '2rem',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            backgroundColor: '#fff',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0070f3'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#eaeaea'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Мои промты</h2>
          <p style={{ color: '#666' }}>Просмотр и управление вашими промтами</p>
        </Link>

        <div
          style={{
            padding: '2rem',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            backgroundColor: '#fff',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Статистика</h2>
          <p style={{ color: '#666' }}>Скоро будет доступна</p>
        </div>
      </div>
    </div>
  )
}


