import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const destinations = await prisma.destination.findMany({
    where: {
      menus: { not: null }
    },
    select: { id: true, name: true, menus: true }
  })

  console.log(`Found ${destinations.length} destinations with menus. Updating menu images...`)

  let totalMenus = 0
  for (const dest of destinations) {
    if (!dest.menus) continue
    
    let menuItems: any[]
    try {
      menuItems = JSON.parse(dest.menus)
    } catch {
      console.log(`  ⚠ Skipping ${dest.name} — invalid JSON`)
      continue
    }

    if (!Array.isArray(menuItems) || menuItems.length === 0) continue

    // Update every menu item's image to the placeholder
    const updated = menuItems.map((item: any) => ({
      ...item,
      image: '/placeholder/menu.jpg'
    }))

    await prisma.destination.update({
      where: { id: dest.id },
      data: { menus: JSON.stringify(updated) }
    })

    console.log(`  ✓ ${dest.name} — updated ${updated.length} menu item(s)`)
    totalMenus += updated.length
  }

  console.log(`\n✅ Done! Updated ${totalMenus} menu items across ${destinations.length} destinations.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
