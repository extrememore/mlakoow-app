import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping parent category slug -> placeholder path
const PLACEHOLDER_MAP: Record<string, string> = {
  'wisata': '/placeholder/wisata.jpg',
  'kuliner': '/placeholder/kuliner.jpg',
  'cafe': '/placeholder/cafe.jpg',
  'hiburan': '/placeholder/hiburan.jpg',
  'oleh-oleh': '/placeholder/oleh-oleh.jpg',
}

function resolvePlaceholder(categorySlug: string, parentSlug?: string | null): string {
  // Direct match
  if (PLACEHOLDER_MAP[categorySlug]) return PLACEHOLDER_MAP[categorySlug]
  // Parent match
  if (parentSlug && PLACEHOLDER_MAP[parentSlug]) return PLACEHOLDER_MAP[parentSlug]
  // Partial match on slug
  for (const key of Object.keys(PLACEHOLDER_MAP)) {
    if (categorySlug.includes(key)) return PLACEHOLDER_MAP[key]
  }
  return '/placeholder/wisata.jpg'
}

async function main() {
  // Load all destinations with their category and category parent
  const destinations = await prisma.destination.findMany({
    include: {
      category: {
        include: {
          parent: true,
        },
      },
    },
  })

  console.log(`Found ${destinations.length} destinations. Updating mainImage...`)

  let updated = 0
  for (const dest of destinations) {
    const placeholder = resolvePlaceholder(
      dest.category.slug,
      dest.category.parent?.slug
    )

    await prisma.destination.update({
      where: { id: dest.id },
      data: { mainImage: placeholder },
    })

    console.log(`  ✓ [${dest.category.slug}] ${dest.name} → ${placeholder}`)
    updated++
  }

  // Also update menu item images if table exists
  try {
    const menus = await (prisma as any).menuItem.findMany()
    console.log(`\nFound ${menus.length} menu items. Updating images...`)
    for (const menu of menus) {
      await (prisma as any).menuItem.update({
        where: { id: menu.id },
        data: { image: '/placeholder/menu.jpg' },
      })
    }
    console.log(`  ✓ All menu images updated to /placeholder/menu.jpg`)
  } catch {
    console.log('  (No menuItem table found, skipping)')
  }

  console.log(`\n✅ Done! Updated ${updated} destinations.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
