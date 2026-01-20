/**
 * Утилиты для работы с URL подключения к базе данных
 */

/**
 * Проверяет и исправляет URL для Neon, добавляя pooler если нужно
 */
export function normalizeNeonUrl(url: string): string {
  if (!url.includes('neon.tech')) {
    return url
  }

  let normalized = url

  // Убираем проблемные параметры
  normalized = normalized.replace(/[&?]channel_binding=[^&]*/g, '')
  
  // Если URL уже содержит pooler, проверяем параметры
  if (normalized.includes('-pooler')) {
    // Убеждаемся, что есть sslmode=require
    if (!normalized.includes('sslmode=')) {
      normalized += (normalized.includes('?') ? '&' : '?') + 'sslmode=require'
    }
    // Добавляем pgbouncer=true для pooler
    if (!normalized.includes('pgbouncer=')) {
      normalized += (normalized.includes('?') ? '&' : '?') + 'pgbouncer=true'
    }
    return normalized
  }

  // Если URL содержит обычный endpoint, пытаемся заменить на pooler
  // Формат Neon: ep-xxx-xxx-pooler.region.aws.neon.tech
  const poolerMatch = normalized.match(/ep-([^-]+)-([^-]+)\.([^.]+)\.aws\.neon\.tech/)
  if (poolerMatch) {
    const [, branch, project, region] = poolerMatch
    normalized = normalized.replace(
      `ep-${branch}-${project}.${region}.aws.neon.tech`,
      `ep-${branch}-${project}-pooler.${region}.aws.neon.tech`
    )
    // Добавляем необходимые параметры
    if (!normalized.includes('sslmode=')) {
      normalized += (normalized.includes('?') ? '&' : '?') + 'sslmode=require'
    }
    if (!normalized.includes('pgbouncer=')) {
      normalized += (normalized.includes('?') ? '&' : '?') + 'pgbouncer=true'
    }
  }

  return normalized
}

/**
 * Проверяет, является ли URL валидным для подключения
 */
export function isValidDatabaseUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false
  }

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:'
  } catch {
    return false
  }
}

