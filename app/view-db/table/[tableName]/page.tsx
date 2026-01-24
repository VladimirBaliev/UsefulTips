'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

interface Column {
  name: string
  type: string
  nullable: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function TableViewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const tableName = params.tableName as string
  const dbType = searchParams.get('dbType') || 'local'

  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRow, setNewRow] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchData()
  }, [tableName, dbType, pagination.page])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api/view-db/table/${tableName}?dbType=${dbType}&page=${pagination.page}&limit=${pagination.limit}`
      )
      const result = await response.json()

      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data || [])
        setColumns(result.columns || [])
        setPagination(result.pagination || pagination)
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (index: number, row: any) => {
    setEditingRow(index)
    setEditForm({ ...row })
  }

  const handleSave = async () => {
    try {
      setError(null)
      const response = await fetch(
        `/api/view-db/table/${tableName}?dbType=${dbType}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editForm.id,
            idColumn: columns[0]?.name || 'id',
            ...Object.fromEntries(
              Object.entries(editForm).filter(([key]) => key !== 'id')
            ),
          }),
        }
      )

      const result = await response.json()
      if (result.error) {
        setError(result.error)
      } else {
        setEditingRow(null)
        fetchData()
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении')
    }
  }

  const handleDelete = async (row: any) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return

    try {
      setError(null)
      const idColumn = columns[0]?.name || 'id'
      const response = await fetch(
        `/api/view-db/table/${tableName}?dbType=${dbType}&id=${row[idColumn]}&idColumn=${idColumn}`,
        { method: 'DELETE' }
      )

      const result = await response.json()
      if (result.error) {
        setError(result.error)
      } else {
        fetchData()
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении')
    }
  }

  const handleCreate = async () => {
    try {
      setError(null)
      const response = await fetch(
        `/api/view-db/table/${tableName}?dbType=${dbType}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRow),
        }
      )

      const result = await response.json()
      if (result.error) {
        setError(result.error)
      } else {
        setShowAddForm(false)
        setNewRow({})
        fetchData()
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании')
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'NULL'
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
      return new Date(value).toLocaleString('ru-RU')
    }
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Таблица: {tableName}</h1>
          <p style={{ color: '#666' }}>
            База данных: <strong>{dbType === 'local' ? 'Локальная' : 'Рабочая'}</strong>
          </p>
        </div>
        <button
          onClick={() => router.push(`/view-db/tables?dbType=${dbType}`)}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          ← Назад к таблицам
        </button>
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

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#666' }}>
          Всего записей: {pagination.total} | Страница {pagination.page} из {pagination.totalPages}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {showAddForm ? 'Отмена' : '+ Добавить запись'}
        </button>
      </div>

      {showAddForm && (
        <div
          style={{
            padding: '1.5rem',
            border: '2px solid #28a745',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: '#f8fff8',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Новая запись</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {columns.map((col) => (
              <div key={col.name}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {col.name} ({col.type})
                </label>
                <input
                  type={col.type === 'timestamp with time zone' || col.type === 'date' ? 'datetime-local' : 'text'}
                  value={newRow[col.name] || ''}
                  onChange={(e) => setNewRow({ ...newRow, [col.name]: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleCreate}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Создать
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка данных...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid #eaeaea', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  {columns.map((col) => (
                    <th
                      key={col.name}
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        borderBottom: '2px solid #ddd',
                        fontWeight: 'bold',
                      }}
                    >
                      {col.name}
                      <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'normal' }}>
                        {col.type}
                      </div>
                    </th>
                  ))}
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      borderBottom: '2px solid #ddd',
                      fontWeight: 'bold',
                    }}
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eaeaea' }}>
                    {editingRow === index ? (
                      <>
                        {columns.map((col) => (
                          <td key={col.name} style={{ padding: '0.5rem' }}>
                            <input
                              type={col.type.includes('timestamp') || col.type === 'date' ? 'datetime-local' : 'text'}
                              value={editForm[col.name] !== null && editForm[col.name] !== undefined ? String(editForm[col.name]) : ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, [col.name]: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #0070f3',
                                borderRadius: '4px',
                              }}
                            />
                          </td>
                        ))}
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button
                            onClick={handleSave}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#28a745',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '0.5rem',
                            }}
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => setEditingRow(null)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#6c757d',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Отмена
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {columns.map((col) => (
                          <td key={col.name} style={{ padding: '1rem', fontSize: '0.9rem' }}>
                            {formatValue(row[col.name])}
                          </td>
                        ))}
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEdit(index, row)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#0070f3',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '0.5rem',
                            }}
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Удалить
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: pagination.page === 1 ? '#f5f5f5' : '#fff',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Назад
              </button>
              <span style={{ padding: '0.5rem 1rem', alignSelf: 'center' }}>
                Страница {pagination.page} из {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: pagination.page >= pagination.totalPages ? '#f5f5f5' : '#fff',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function TableViewPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка...</div>
      </div>
    }>
      <TableViewPageContent />
    </Suspense>
  )
}




