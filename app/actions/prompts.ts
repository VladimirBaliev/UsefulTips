'use server'

import { prisma } from '@/lib/prisma'
import { getUserId, requireAuth } from '@/lib/auth-server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Схемы валидации
const createPromptSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Заголовок слишком длинный'),
  content: z.string().min(1, 'Содержание обязательно'),
  isPublic: z.boolean().default(false),
})

const updatePromptSchema = z.object({
  id: z.string().uuid('Неверный ID'),
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Заголовок слишком длинный'),
  content: z.string().min(1, 'Содержание обязательно'),
  isPublic: z.boolean(),
})

/**
 * Создать новый промт
 */
export async function createPrompt(formData: FormData) {
  try {
    const userId = await requireAuth()

    const rawData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      isPublic: formData.get('isPublic') === 'true' || formData.get('isPublic') === 'on',
    }

    const validated = createPromptSchema.parse(rawData)

    const prompt = await prisma.prompt.create({
      data: {
        title: validated.title,
        content: validated.content,
        isPublic: validated.isPublic,
        ownerId: userId,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')

    return { success: true, data: prompt }
  } catch (error) {
    console.error('Error creating prompt:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Ошибка валидации' }
    }
    return { success: false, error: 'Не удалось создать промт' }
  }
}

/**
 * Обновить промт
 * Проверяет, что пользователь является владельцем
 */
export async function updatePrompt(formData: FormData) {
  try {
    const userId = await requireAuth()

    const rawData = {
      id: formData.get('id') as string,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      isPublic: formData.get('isPublic') === 'true' || formData.get('isPublic') === 'on',
    }

    const validated = updatePromptSchema.parse(rawData)

    // Проверка прав: пользователь может изменять только свои промты
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: validated.id },
    })

    if (!existingPrompt) {
      return { success: false, error: 'Промт не найден' }
    }

    if (existingPrompt.ownerId !== userId) {
      return { success: false, error: 'Нет прав на изменение этого промта' }
    }

    const prompt = await prisma.prompt.update({
      where: { id: validated.id },
      data: {
        title: validated.title,
        content: validated.content,
        isPublic: validated.isPublic,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')

    return { success: true, data: prompt }
  } catch (error) {
    console.error('Error updating prompt:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Ошибка валидации' }
    }
    return { success: false, error: 'Не удалось обновить промт' }
  }
}

/**
 * Удалить промт
 * Проверяет, что пользователь является владельцем
 */
export async function deletePrompt(id: string) {
  try {
    const userId = await requireAuth()

    // Проверка прав
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    })

    if (!existingPrompt) {
      return { success: false, error: 'Промт не найден' }
    }

    if (existingPrompt.ownerId !== userId) {
      return { success: false, error: 'Нет прав на удаление этого промта' }
    }

    await prisma.prompt.delete({
      where: { id },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')

    return { success: true }
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return { success: false, error: 'Не удалось удалить промт' }
  }
}

/**
 * Переключить публичность промта
 */
export async function togglePublic(id: string) {
  try {
    const userId = await requireAuth()

    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    })

    if (!existingPrompt) {
      return { success: false, error: 'Промт не найден' }
    }

    if (existingPrompt.ownerId !== userId) {
      return { success: false, error: 'Нет прав на изменение этого промта' }
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        isPublic: !existingPrompt.isPublic,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')

    return { success: true, data: prompt }
  } catch (error) {
    console.error('Error toggling public:', error)
    return { success: false, error: 'Не удалось изменить публичность' }
  }
}

/**
 * Переключить избранное
 */
export async function toggleFavorite(id: string) {
  try {
    const userId = await requireAuth()

    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    })

    if (!existingPrompt) {
      return { success: false, error: 'Промт не найден' }
    }

    // Пользователь может добавлять в избранное любые промты (свои и чужие)
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        isFavorite: !existingPrompt.isFavorite,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')

    return { success: true, data: prompt }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: 'Не удалось изменить избранное' }
  }
}




