import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  // Get ALL categories with parent info
  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }]
  })
  
  console.log('\n=== ALL CATEGORIES ===')
  console.log('Total:', categories.length)
  
  const parents = categories.filter(c => !c.parentId)
  const children = categories.filter(c => c.parentId)
  
  console.log('\n--- PARENT CATEGORIES ---')
  for (const p of parents) {
    console.log(`  [parent] slug="${p.slug}" name="${p.name}"`)
  }
  
  console.log('\n--- CHILD CATEGORIES (subcategories) ---')
  for (const c of children) {
    const parent = parents.find(p => p.id === c.parentId)
    console.log(`  [child] slug="${c.slug}" name="${c.name}" → parent="${parent?.slug}"`)
  }

  // Check menus with images
  console.log('\n=== DESTINATIONS WITH MENUS ===')
  const destsWithMenus = await prisma.destination.findMany({
    where: { menus: { not: null } },
    select: { name: true, menus: true, category: { select: { slug: true } } }
  })
  
  for (const d of destsWithMenus) {
    let menus: any[] = []
    try { menus = JSON.parse(d.menus!) } catch(e) {}
    const hasImages = menus.some(m => m.image)
    console.log(`  "${d.name}" (${d.category.slug}) — ${menus.length} menus, hasImages=${hasImages}`)
  }
  
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
