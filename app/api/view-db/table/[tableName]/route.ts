import { NextRequest, NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db-connection'
import { DbType } from '@/lib/db-config'

// GET - получение данных таблицы с пагинацией
export async function GET(
  request: NextRequest,
  { params }: { params: { tableName: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const pool = getDbPool(dbType)
    const tableName = params.tableName

    // Проверка существования таблицы
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName]
    )

    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ error: 'Таблица не найдена' }, { status: 404 })
    }

    // Получаем количество записей
    const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`)
    const total = parseInt(countResult.rows[0].count)

    // Получаем данные с пагинацией
    const dataResult = await pool.query(
      `SELECT * FROM "${tableName}" ORDER BY (SELECT NULL) LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    // Получаем информацию о колонках
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName])

    const columns = columnsResult.rows.map((row: any) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
    }))

    return NextResponse.json({
      data: dataResult.rows,
      columns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении данных' },
      { status: 500 }
    )
  }
}

// POST - создание новой записи
export async function POST(
  request: NextRequest,
  { params }: { params: { tableName: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType
    const body = await request.json()

    const pool = getDbPool(dbType)
    const tableName = params.tableName

    const columns = Object.keys(body)
    const values = Object.values(body)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

    const result = await pool.query(
      `INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    )

    return NextResponse.json({ data: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании записи' },
      { status: 500 }
    )
  }
}

// PUT - обновление записи
export async function PUT(
  request: NextRequest,
  { params }: { params: { tableName: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType
    const body = await request.json()
    const { id, idColumn = 'id', ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
    }

    const pool = getDbPool(dbType)
    const tableName = params.tableName

    const columns = Object.keys(updateData)
    const values = Object.values(updateData)
    const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ')

    const result = await pool.query(
      `UPDATE "${tableName}" 
       SET ${setClause} 
       WHERE "${idColumn}" = $${values.length + 1} 
       RETURNING *`,
      [...values, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении записи' },
      { status: 500 }
    )
  }
}

// DELETE - удаление записи
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tableName: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType
    const id = searchParams.get('id')
    const idColumn = searchParams.get('idColumn') || 'id'

    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
    }

    const pool = getDbPool(dbType)
    const tableName = params.tableName

    const result = await pool.query(
      `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка при удалении записи' },
      { status: 500 }
    )
  }
}


