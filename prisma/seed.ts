import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.note.deleteMany()

  // Create a test user first
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  // Create sample notes
  await prisma.note.createMany({
    data: [
      {
        title: 'Добро пожаловать в UsefulTips',
        ownerId: testUser.id,
      },
      {
        title: 'Это пример записи из базы данных',
        ownerId: testUser.id,
      },
      {
        title: 'Данные загружаются из Neon PostgreSQL',
        ownerId: testUser.id,
      },
    ],
  })

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })










