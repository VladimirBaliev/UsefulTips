import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getNotes() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { notes, error: null }
  } catch (error) {
    console.error('Database error:', error)
    return { notes: [], error: 'Ошибка подключения к базе данных' }
  }
}

export default async function Home() {
  const { notes, error } = await getNotes()

  return (
    <main className="container">
      <div className="header">
        <h1>UsefulTips</h1>
        <p>Next.js + Prisma + Neon PostgreSQL</p>
      </div>

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Проверьте настройки DATABASE_URL в переменных окружения
          </p>
        </div>
      )}

      {!error && notes.length === 0 && (
        <div className="empty-state">
          <p>Записей пока нет. Запустите seed скрипт: npm run db:seed</p>
        </div>
      )}

      {!error && notes.length > 0 && (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-title">{note.title}</div>
              <div className="note-date">
                {new Date(note.createdAt).toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

