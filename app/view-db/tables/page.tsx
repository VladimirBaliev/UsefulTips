'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function TablesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dbType = searchParams.get('dbType') || 'local'
  
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTables()
  }, [dbType])

  const fetchTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/view-db/tables?dbType=${dbType}`)
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setTables(data.tables || [])
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке таблиц')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Таблицы базы данных</h1>
          <p style={{ color: '#666' }}>
            База данных: <strong>{dbType === 'local' ? 'Локальная' : 'Рабочая'}</strong>
          </p>
        </div>
        <Link
          href="/view-db"
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

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '1rem',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка таблиц...</div>
      ) : tables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Таблицы не найдены
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tables.map((table) => (
            <div
              key={table}
              style={{
                padding: '1.5rem',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0070f3'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#eaeaea'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {table}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Таблица
                </div>
              </div>
              <Link
                href={`/view-db/table/${table}?dbType=${dbType}`}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Открыть
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TablesPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка...</div>
      </div>
    }>
      <TablesPageContent />
    </Suspense>
  )
}




