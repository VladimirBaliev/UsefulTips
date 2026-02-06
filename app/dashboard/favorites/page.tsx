import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromptsList } from '@/components/dashboard/PromptsList'

export const dynamic = 'force-dynamic'

async function getFavoritePrompts(userId: string, search?: string, page: number = 1) {
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const where: any = {
    isFavorite: true,
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [prompts, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.prompt.count({ where }),
  ])

  return {
    prompts,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  }
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const search = searchParams.search || ''
  const page = parseInt(searchParams.page || '1', 10)

  const { prompts, total, totalPages } = await getFavoritePrompts(user.id, search, page)

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Личный кабинет</h1>
          <h2 className="text-xl text-gray-600">Избранное</h2>
        </div>

        <PromptsList
          prompts={prompts}
          currentUserId={user.id}
          search={search}
          page={page}
          totalPages={totalPages}
          total={total}
        />
      </div>
    </div>
  )
}




