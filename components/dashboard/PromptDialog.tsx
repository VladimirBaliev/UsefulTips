'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createPrompt, updatePrompt } from '@/app/actions/prompts'
import { useRouter } from 'next/navigation'

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt?: {
    id: string
    title: string
    content: string
    isPublic: boolean
  } | null
}

export function PromptDialog({ open, onOpenChange, prompt }: PromptDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!prompt

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEdit
        ? await updatePrompt(formData)
        : await createPrompt(formData)

      if (result.success) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(result.error || 'Произошла ошибка')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактировать промт' : 'Новый промт'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <input type="hidden" name="id" value={prompt.id} />
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Заголовок
            </label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={prompt?.title || ''}
              placeholder="Введите заголовок промта"
              maxLength={200}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Содержание
            </label>
            <Textarea
              id="content"
              name="content"
              required
              defaultValue={prompt?.content || ''}
              placeholder="Введите содержание промта"
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              defaultChecked={prompt?.isPublic || false}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Сделать публичным
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}




