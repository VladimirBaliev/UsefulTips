import { getCurrentUser, requireAuth } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyPromptsPage() {
  const userId = await requireAuth().catch(() => null)

  if (!userId) {
    redirect('/login')
  }

  const prompts = await prisma.prompt.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      category: true,
    },
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Мои промты</h1>
          <p style={{ color: '#666' }}>Управление вашими промтами</p>
        </div>
        <Link
          href="/dashboard"
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textDecoration: 'none',
            color: '#333',
          }}
        >
          ← Назад
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            backgroundColor: '#fff',
          }}
        >
          <p style={{ color: '#666', fontSize: '1.1rem' }}>У вас пока нет промтов</p>
          <p style={{ color: '#999', marginTop: '0.5rem' }}>
            Создайте свой первый промт!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              style={{
                padding: '1.5rem',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{prompt.title}</h2>
                  {prompt.description && (
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>{prompt.description}</p>
                  )}
                </div>
                <div
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: prompt.visibility === 'PUBLIC' ? '#e8f5e9' : '#fff3e0',
                    color: prompt.visibility === 'PUBLIC' ? '#2e7d32' : '#e65100',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  {prompt.visibility === 'PUBLIC' ? 'Публичный' : 'Приватный'}
                </div>
              </div>
              <div style={{ color: '#999', fontSize: '0.875rem' }}>
                Обновлено: {new Date(prompt.updatedAt).toLocaleString('ru-RU')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

