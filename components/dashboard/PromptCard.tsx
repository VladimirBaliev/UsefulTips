'use client'

import { MessageSquare, Star, Pencil, Trash2, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'
import {
  deletePrompt,
  togglePublic,
  toggleFavorite,
} from '@/app/actions/prompts'
import { useRouter } from 'next/navigation'

interface PromptCardProps {
  prompt: {
    id: string
    title: string
    content: string
    isPublic: boolean
    isFavorite: boolean
    createdAt: Date
    ownerId: string
  }
  currentUserId: string
  onEdit: (prompt: PromptCardProps['prompt']) => void
}

export function PromptCard({ prompt, currentUserId, onEdit }: PromptCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = prompt.ownerId === currentUserId

  // Превью контента (первые 1-2 строки)
  const preview = prompt.content.length > 100
    ? prompt.content.substring(0, 100) + '...'
    : prompt.content

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот промт?')) {
      return
    }

    setIsDeleting(true)
    startTransition(async () => {
      const result = await deletePrompt(prompt.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Ошибка при удалении')
        setIsDeleting(false)
      }
    })
  }

  const handleTogglePublic = () => {
    startTransition(async () => {
      const result = await togglePublic(prompt.id)
      if (!result.success) {
        alert(result.error || 'Ошибка при изменении публичности')
      }
    })
  }

  const handleToggleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavorite(prompt.id)
      if (!result.success) {
        alert(result.error || 'Ошибка при изменении избранного')
      }
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Иконка чата */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {prompt.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {preview}
          </p>
        </div>

        {/* Действия */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {/* Избранное */}
          <button
            onClick={handleToggleFavorite}
            disabled={isPending}
            className={`
              p-2 rounded-md transition-colors
              ${prompt.isFavorite
                ? 'text-yellow-500 hover:bg-yellow-50'
                : 'text-gray-400 hover:bg-gray-100'
              }
              disabled:opacity-50
            `}
            title={prompt.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Публичность (только для владельца) */}
          {isOwner && (
            <button
              onClick={handleTogglePublic}
              disabled={isPending}
              className="p-2 rounded-md text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              title={prompt.isPublic ? 'Сделать приватным' : 'Сделать публичным'}
            >
              {prompt.isPublic ? (
                <Globe className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Редактирование (только для владельца) */}
          {isOwner && (
            <button
              onClick={() => onEdit(prompt)}
              disabled={isPending}
              className="p-2 rounded-md text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Редактировать"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* Удаление (только для владельца) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isPending || isDeleting}
              className="p-2 rounded-md text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}




