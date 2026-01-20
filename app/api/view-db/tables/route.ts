import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, testConnection } from '@/lib/db-connection'
import { DbType } from '@/lib/db-config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType

    // Проверка подключения
    const connectionTest = await testConnection(dbType)
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Ошибка подключения: ${connectionTest.error}` },
        { status: 500 }
      )
    }

    const pool = getDbPool(dbType)

    // Получаем список таблиц из схемы public
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    const tables = result.rows.map((row: any) => row.table_name)

    return NextResponse.json({ tables, dbType })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении списка таблиц' },
      { status: 500 }
    )
  }
}


