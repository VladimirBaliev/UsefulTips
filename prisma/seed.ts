import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.note.deleteMany()

  // Create sample notes
  await prisma.note.createMany({
    data: [
      {
        title: 'Добро пожаловать в UsefulTips',
      },
      {
        title: 'Это пример записи из базы данных',
      },
      {
        title: 'Данные загружаются из Neon PostgreSQL',
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







