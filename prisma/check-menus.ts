import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const dest = await prisma.destination.findUnique({
    where: { slug: 'rujak-cingur-ahmad-jaiz' },
    select: { name: true, menus: true, category: { select: { slug: true } } }
  })
  console.log('Name:', dest?.name)
  console.log('Category slug:', dest?.category?.slug)
  console.log('Menus field:', dest?.menus)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
