import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const events = [
  {
    title: 'Festival Kuliner Tunjungan',
    slug: 'festival-kuliner-tunjungan',
    description: 'Nikmati ragam kuliner khas Suroboyo dan nusantara di sepanjang jalan bersejarah Tunjungan. Diiringi live music dan penampilan seni.',
    location: 'Jalan Tunjungan, Surabaya',
    startDate: new Date('2024-05-15T15:00:00Z'),
    endDate: new Date('2024-05-20T22:00:00Z'),
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    category: 'Festival',
    price: 'Gratis',
  },
  {
    title: 'Surabaya Art & Culture Expo',
    slug: 'surabaya-art-culture-expo',
    description: 'Pameran seni terbesar di Surabaya menampilkan karya perupa lokal, pertunjukan tari tradisional, hingga workshop kerajinan.',
    location: 'Balai Pemuda, Surabaya',
    startDate: new Date('2024-06-01T09:00:00Z'),
    endDate: new Date('2024-06-07T21:00:00Z'),
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
    category: 'Pameran',
    price: 'Rp 25.000',
  },
  {
    title: 'Jazz Traffic Festival',
    slug: 'jazz-traffic-festival',
    description: 'Panggung musik jazz tahunan yang menghadirkan musisi papan atas lokal dan internasional. Suasana meriah di tengah kota.',
    location: 'Grand City Convex, Surabaya',
    startDate: new Date('2024-08-10T14:00:00Z'),
    endDate: new Date('2024-08-11T23:30:00Z'),
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    category: 'Musik',
    price: 'Mulai Rp 150.000',
  },
  {
    title: 'Pawai Bunga & Parade Budaya',
    slug: 'pawai-bunga-surabaya',
    description: 'Memperingati Hari Jadi Kota Surabaya (HJKS) dengan pawai mobil hias bunga yang indah dan karnaval pakaian adat nusantara.',
    location: 'Tugu Pahlawan - Taman Bungkul',
    startDate: new Date('2024-05-28T07:00:00Z'),
    endDate: new Date('2024-05-28T12:00:00Z'),
    image: 'https://images.unsplash.com/photo-1533604128509-c186064f2fb9',
    category: 'Budaya',
    price: 'Gratis',
  }
]

async function main() {
  console.log('Seeding Events...')
  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    })
  }
  console.log('Events seeded successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
