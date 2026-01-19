import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/db-connection'
import { DbType, getDbConfig } from '@/lib/db-config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType

    // Сначала проверяем, настроен ли URL
    const config = getDbConfig(dbType)
    if (!config.url || config.url.trim() === '') {
      return NextResponse.json({
        success: false,
        error: `DATABASE_URL не настроен для ${dbType === 'local' ? 'локальной' : 'рабочей'} БД.\n\nПроверьте переменные окружения:\n- Для локальной БД: DATABASE_URL_LOCAL или DATABASE_URL\n- Для рабочей БД: DATABASE_URL\n\nСоздайте файл .env в корне проекта и добавьте переменные.`,
      })
    }

    const result = await testConnection(dbType)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка при тестировании подключения' },
      { status: 500 }
    )
  }
}

