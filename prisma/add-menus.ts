import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🍜 Adding menus to kuliner, cafe & oleh-oleh destinations...')

  // KULINER - Rujak Cingur Ahmad Jaiz
  await prisma.destination.update({
    where: { slug: 'rujak-cingur-ahmad-jaiz' },
    data: {
      menus: JSON.stringify([
        { name: 'Rujak Cingur Komplit', price: 25000, desc: 'Cingur, petis udang, sayuran segar, dan lontong', recommended: true },
        { name: 'Rujak Cingur Setengah', price: 15000, desc: 'Porsi lebih kecil, cocok untuk pertama kali mencoba' },
        { name: 'Es Dawet Segar', price: 8000, desc: 'Minuman pendamping khas warung ini' },
        { name: 'Lontong Campur', price: 18000, desc: 'Lontong + tauco + krupuk + sayuran', recommended: false },
      ])
    }
  })

  // KULINER - Warung Rawon Nguling
  await prisma.destination.update({
    where: { slug: 'warung-rawon-nguling' },
    data: {
      menus: JSON.stringify([
        { name: 'Rawon Spesial (Daging Banyak)', price: 45000, desc: 'Kuah kluwek pekat, daging sapi empuk, tauge, telur asin', recommended: true },
        { name: 'Rawon Biasa', price: 32000, desc: 'Porsi standar dengan kuah rawon legendaris 1948' },
        { name: 'Rawon + Telur Asin', price: 38000, desc: 'Rawon biasa ditambah telur asin khas' },
        { name: 'Nasi Putih', price: 5000, desc: 'Tambahan nasi putih pulen' },
        { name: 'Es Teh Manis', price: 5000, desc: 'Minuman segar pendamping' },
      ])
    }
  })

  // KULINER - Pecel Semanggi Bu Siti
  await prisma.destination.update({
    where: { slug: 'pecel-semanggi-bu-siti' },
    data: {
      menus: JSON.stringify([
        { name: 'Pecel Semanggi', price: 12000, desc: 'Daun semanggi rebus dengan bumbu kacang petis khas', recommended: true },
        { name: 'Pecel Semanggi + Kerupuk Puli', price: 15000, desc: 'Dilengkapi kerupuk puli renyah khas Surabaya' },
        { name: 'Es Jeruk Peras', price: 7000, desc: 'Jeruk segar cocok diminum setelah makan pecel' },
      ])
    }
  })

  // Cek apakah ada destinasi cafe/oleh-oleh di database
  const allDests = await prisma.destination.findMany({
    select: { slug: true, name: true, category: { select: { slug: true } } }
  })
  
  // Tambahkan menus untuk semua destinasi yang belum punya menus (Grandfather Coffee Shop, Sego Sambel Mak Yeye, dll)
  const destNeedingMenus = allDests.filter(d => 
    ['zangrandi-ice-cream', 'sego-sambel-mak-yeye', 'grandfather-coffee-shop', 
     'batik-semar-surabaya', 'batik-tulis-tanjungbumi'].includes(d.slug)
  )
  
  console.log('Found destinations needing menus:', destNeedingMenus.map(d => d.slug))

  // Generic menus for other food/cafe destinations if they exist
  for (const dest of destNeedingMenus) {
    const categorySlug = dest.category.slug
    let menus: any[] = []
    
    if (dest.slug === 'grandfather-coffee-shop') {
      menus = [
        { name: 'Signature Grandfather Blend', price: 35000, desc: 'House blend espresso dengan body penuh dan aftertaste cokelat', recommended: true },
        { name: 'Pour Over V60', price: 40000, desc: 'Single origin pilihan barista, diseduh manual' },
        { name: 'Matcha Latte', price: 38000, desc: 'Premium matcha Jepang dengan susu oat' },
        { name: 'Croissant Butter', price: 28000, desc: 'Croissant renyah di luar, lembut di dalam' },
        { name: 'Banana Foster Waffle', price: 45000, desc: 'Waffle hangat dengan pisang caramel dan es krim', recommended: true },
      ]
    } else if (dest.slug === 'zangrandi-ice-cream') {
      menus = [
        { name: 'Es Krim Vanilla Klasik', price: 25000, desc: 'Vanilla original resep Belanda sejak 1930', recommended: true },
        { name: 'Es Krim Cokelat', price: 25000, desc: 'Dark chocolate creamy dengan taburan cokelat serut' },
        { name: 'Sundae Special', price: 45000, desc: 'Es krim 3 rasa + sirup + buah segar', recommended: true },
        { name: 'Float Soda Zangrandi', price: 35000, desc: 'Es krim mengambang di atas soda segar' },
        { name: 'Es Krim Campuran', price: 38000, desc: 'Pilih 2 rasa favorit dalam satu cup' },
      ]
    } else if (dest.slug === 'sego-sambel-mak-yeye') {
      menus = [
        { name: 'Sego Sambel Ayam', price: 20000, desc: 'Nasi + sambel petis + ayam goreng crispy', recommended: true },
        { name: 'Sego Sambel Tahu Tempe', price: 15000, desc: 'Nasi + sambel + tahu tempe goreng renyah' },
        { name: 'Sego Sambel Ikan Bandeng', price: 25000, desc: 'Bandeng goreng + sambel petis level pedas bisa request' },
        { name: 'Sego Sambel Komplit', price: 30000, desc: 'Ayam + tahu + tempe + ikan dalam satu porsi', recommended: false },
        { name: 'Es Teh Susu', price: 8000, desc: 'Teh susu dingin segar' },
      ]
    }

    if (menus.length > 0) {
      await prisma.destination.update({
        where: { slug: dest.slug },
        data: { menus: JSON.stringify(menus) }
      })
      console.log(`✅ Updated menus for: ${dest.name}`)
    }
  }

  console.log('✅ All menus added successfully!')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
