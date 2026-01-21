import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Создание тестовых данных...')

  // Создание тестового пользователя
  const user = await prisma.user.create({
    data: {
      email: `test-user-${Date.now()}@example.com`,
      name: 'Test User',
    },
  })
  console.log('✓ Создан тестовый пользователь:', user)

  // Создание категории (если нужно)
  const category = await prisma.category.create({
    data: {
      category: 'Тестовая категория',
    },
  })
  console.log('✓ Создана категория:', category)

  // Создание тестового промта
  const prompt = await prisma.prompt.create({
    data: {
      ownerId: user.id,
      title: 'Тестовый промт',
      content: 'Это содержимое тестового промта для проверки базы данных.',
      description: 'Описание тестового промта',
      categoryId: category.id,
      visibility: 'PUBLIC',
      publishedAt: new Date(),
    },
  })
  console.log('✓ Создан тестовый промт:', prompt)

  // Создание голоса (vote) за промт
  const vote = await prisma.vote.create({
    data: {
      userId: user.id,
      promptId: prompt.id,
      value: 1,
    },
  })
  console.log('✓ Создан голос:', vote)

  console.log('\n✅ Все тестовые данные успешно созданы!')
  console.log(`Пользователь ID: ${user.id}`)
  console.log(`Промт ID: ${prompt.id}`)
  console.log(`Голос ID: ${vote.id}`)
}

main()
  .catch((e) => {
    console.error('Ошибка при создании тестовых данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



