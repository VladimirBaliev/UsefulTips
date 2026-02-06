'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PromptCard } from './PromptCard'
import { PromptDialog } from './PromptDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Prompt {
  id: string
  title: string
  content: string
  isPublic: boolean
  isFavorite: boolean
  createdAt: Date
  ownerId: string
  owner: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface PublicPromptsListProps {
  prompts: Prompt[]
  currentUserId: string
  search?: string
  page: number
  totalPages: number
  total: number
}

export function PublicPromptsList({
  prompts,
  currentUserId,
  search: initialSearch = '',
  page,
  totalPages,
  total,
}: PublicPromptsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; title: string; content: string; isPublic: boolean } | null>(null)

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Обновление URL при изменении поиска
  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (debouncedSearch) {
          params.set('search', debouncedSearch)
        } else {
          params.delete('search')
        }
        params.set('page', '1')
        router.push(`/dashboard/public?${params.toString()}`)
      })
    }
  }, [debouncedSearch, initialSearch, router, searchParams])

  const handleEdit = (prompt: { id: string; title: string; content: string; isPublic: boolean }) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    }
    params.set('page', newPage.toString())
    router.push(`/dashboard/public?${params.toString()}`)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Поиск по заголовку или содержанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Список промтов */}
        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {search ? 'Ничего не найдено' : 'Публичных советов пока нет'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div key={prompt.id}>
                <PromptCard
                  prompt={{
                    id: prompt.id,
                    title: prompt.title,
                    content: prompt.content,
                    isPublic: prompt.isPublic,
                    isFavorite: prompt.isFavorite,
                    createdAt: prompt.createdAt,
                    ownerId: prompt.ownerId,
                  }}
                  currentUserId={currentUserId}
                  onEdit={handleEdit}
                />
                {prompt.ownerId !== currentUserId && (
                  <p className="text-xs text-gray-500 mt-1 ml-12">
                    Автор: {prompt.owner.name || prompt.owner.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-600">
              Показано {prompts.length} из {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isPending}
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </Button>
              <span className="text-sm text-gray-600">
                Страница {page} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || isPending}
              >
                Вперед
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Диалог редактирования */}
      {editingPrompt && (
        <PromptDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditingPrompt(null)
            }
          }}
          prompt={editingPrompt}
        />
      )}
    </>
  )
}




