import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

// Unsplash food images (free, no auth needed)
const FOOD_IMAGES = {
  rujak:     'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=200&q=70',
  rawon:     'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=70',
  pecel:     'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&q=70',
  sate:      'https://images.unsplash.com/photo-1555126634-323283e090fa?w=200&q=70',
  nasi:      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&q=70',
  minuman:   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=70',
  kue:       'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&q=70',
  snack:     'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=70',
  sambal:    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=70',
  icecream:  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&q=70',
  batik:     'https://images.unsplash.com/photo-1562158079-e0b0d931b1d7?w=200&q=70',
  souvenir:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70',
  spikoe:    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=200&q=70',
  default:   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=70',
}

// Map destination → array of image URLs for each menu item
const MENU_IMAGES: Record<string, string[]> = {
  'rujak-cingur-ahmad-jaiz':     [FOOD_IMAGES.rujak, FOOD_IMAGES.nasi, FOOD_IMAGES.minuman, FOOD_IMAGES.rujak],
  'warung-rawon-nguling':        [FOOD_IMAGES.rawon, FOOD_IMAGES.rawon, FOOD_IMAGES.rawon, FOOD_IMAGES.nasi, FOOD_IMAGES.minuman],
  'pecel-semanggi-bu-siti':      [FOOD_IMAGES.pecel, FOOD_IMAGES.pecel, FOOD_IMAGES.minuman],
  'sego-sambel-mak-yeye':        [FOOD_IMAGES.sambal, FOOD_IMAGES.nasi, FOOD_IMAGES.sambal, FOOD_IMAGES.nasi, FOOD_IMAGES.minuman],
  'zangrandi-ice-cream':         [FOOD_IMAGES.icecream, FOOD_IMAGES.icecream, FOOD_IMAGES.icecream, FOOD_IMAGES.minuman, FOOD_IMAGES.icecream],
  'spikoe-resep-kuno':           [FOOD_IMAGES.spikoe, FOOD_IMAGES.kue, FOOD_IMAGES.kue],
  'lapis-kukus-pahlawan':        [FOOD_IMAGES.kue, FOOD_IMAGES.kue, FOOD_IMAGES.minuman],
  'wisata-rasa-almond-crispy':   [FOOD_IMAGES.snack, FOOD_IMAGES.snack, FOOD_IMAGES.snack],
  'pusat-oleh-oleh-bu-rudy':     [FOOD_IMAGES.snack, FOOD_IMAGES.kue, FOOD_IMAGES.sambal, FOOD_IMAGES.souvenir],
  'kerupuk-ikan-sentra-kenjeran':[FOOD_IMAGES.snack, FOOD_IMAGES.snack, FOOD_IMAGES.snack],
  'kue-bikang-peneleh':          [FOOD_IMAGES.kue, FOOD_IMAGES.kue, FOOD_IMAGES.kue, FOOD_IMAGES.minuman],
  'cakue-peneleh':               [FOOD_IMAGES.snack, FOOD_IMAGES.snack, FOOD_IMAGES.minuman],
  'siropen-telasih':             [FOOD_IMAGES.minuman, FOOD_IMAGES.minuman, FOOD_IMAGES.minuman, FOOD_IMAGES.minuman],
  'bolu-joeang-surabaya':        [FOOD_IMAGES.kue, FOOD_IMAGES.kue, FOOD_IMAGES.kue],
  'bandeng-asap-sidoarjo-cabang-sby': [FOOD_IMAGES.default, FOOD_IMAGES.default, FOOD_IMAGES.sambal, FOOD_IMAGES.default],
  'belinjo-udang-boyya':         [FOOD_IMAGES.snack, FOOD_IMAGES.snack, FOOD_IMAGES.snack],
  'petis-udang-sidoarjo-ny-siok-cab-sby': [FOOD_IMAGES.sambal, FOOD_IMAGES.sambal, FOOD_IMAGES.sambal],
  'abon-sapi-padmosusastro':     [FOOD_IMAGES.default, FOOD_IMAGES.default, FOOD_IMAGES.default],
  'roti-in-surabaya':            [FOOD_IMAGES.kue, FOOD_IMAGES.kue, FOOD_IMAGES.kue],
  'kue-mente-nyonya':            [FOOD_IMAGES.kue, FOOD_IMAGES.kue, FOOD_IMAGES.kue],
}

async function main() {
  console.log('🖼️  Adding images to menus...')

  for (const [slug, images] of Object.entries(MENU_IMAGES)) {
    const dest = await prisma.destination.findUnique({
      where: { slug },
      select: { menus: true, name: true }
    })
    if (!dest || !dest.menus) {
      console.log(`  ⚠️  Not found or no menus: ${slug}`)
      continue
    }

    let menus: any[] = []
    try { menus = JSON.parse(dest.menus) } catch(e) { continue }

    // Assign images by index
    const updatedMenus = menus.map((m: any, i: number) => ({
      ...m,
      image: m.image || images[i] || FOOD_IMAGES.default
    }))

    await prisma.destination.update({
      where: { slug },
      data: { menus: JSON.stringify(updatedMenus) }
    })
    console.log(`  ✅ ${dest.name}: added images to ${updatedMenus.length} menus`)
  }

  console.log('\n✅ Done!')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
