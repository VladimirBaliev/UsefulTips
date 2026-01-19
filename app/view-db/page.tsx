'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type DbType = 'local' | 'remote'

export default function ViewDbPage() {
  const router = useRouter()
  const [selectedDb, setSelectedDb] = useState<DbType>('local')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<Record<DbType, boolean | null>>({
    local: null,
    remote: null,
  })
  const [connectionErrors, setConnectionErrors] = useState<Record<DbType, string | null>>({
    local: null,
    remote: null,
  })

  useEffect(() => {
    // Проверяем подключения
    const checkConnections = async () => {
      for (const dbType of ['local', 'remote'] as DbType[]) {
        try {
          const response = await fetch(`/api/view-db/test?dbType=${dbType}`)
          const data = await response.json()
          setConnectionStatus((prev) => ({
            ...prev,
            [dbType]: data.success,
          }))
          setConnectionErrors((prev) => ({
            ...prev,
            [dbType]: data.success ? null : (data.error || 'Ошибка подключения'),
          }))
        } catch (err: any) {
          setConnectionStatus((prev) => ({
            ...prev,
            [dbType]: false,
          }))
          setConnectionErrors((prev) => ({
            ...prev,
            [dbType]: err.message || 'Ошибка при проверке подключения',
          }))
        }
      }
    }
    checkConnections()
  }, [])

  const handleContinue = () => {
    router.push(`/view-db/tables?dbType=${selectedDb}`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Просмотр базы данных</h1>
        <p style={{ color: '#666' }}>Выберите базу данных для работы</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <label
          style={{
            padding: '1.5rem',
            border: `2px solid ${selectedDb === 'local' ? '#0070f3' : '#eaeaea'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: selectedDb === 'local' ? '#f0f8ff' : '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={() => setSelectedDb('local')}
        >
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Локальная БД</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Используется для разработки и тестирования
            </div>
          </div>
          <div>
            <input
              type="radio"
              name="dbType"
              value="local"
              checked={selectedDb === 'local'}
              onChange={() => setSelectedDb('local')}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            {connectionStatus.local !== null && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ color: connectionStatus.local ? '#28a745' : '#dc3545', marginBottom: '0.25rem' }}>
                  {connectionStatus.local ? '✓ Подключено' : '✗ Не подключено'}
                </div>
                {connectionErrors.local && (
                  <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.5rem', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                    {connectionErrors.local}
                  </div>
                )}
              </div>
            )}
          </div>
        </label>

        <label
          style={{
            padding: '1.5rem',
            border: `2px solid ${selectedDb === 'remote' ? '#0070f3' : '#eaeaea'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: selectedDb === 'remote' ? '#f0f8ff' : '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={() => setSelectedDb('remote')}
        >
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Рабочая БД</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Продакшн база данных
            </div>
          </div>
          <div>
            <input
              type="radio"
              name="dbType"
              value="remote"
              checked={selectedDb === 'remote'}
              onChange={() => setSelectedDb('remote')}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            {connectionStatus.remote !== null && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ color: connectionStatus.remote ? '#28a745' : '#dc3545', marginBottom: '0.25rem' }}>
                  {connectionStatus.remote ? '✓ Подключено' : '✗ Не подключено'}
                </div>
                {connectionErrors.remote && (
                  <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.5rem', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                    {connectionErrors.remote}
                  </div>
                )}
              </div>
            )}
          </div>
        </label>
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

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textDecoration: 'none',
            color: '#333',
          }}
        >
          Отмена
        </Link>
        <button
          onClick={handleContinue}
          disabled={loading || connectionStatus[selectedDb] === false}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: connectionStatus[selectedDb] === false ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: connectionStatus[selectedDb] === false ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Загрузка...' : 'Продолжить'}
        </button>
      </div>
    </div>
  )
}

