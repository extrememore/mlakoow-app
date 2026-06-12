import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import KanvasClient from './KanvasClient'
import Navbar from '@/components/layout/Navbar'

export default async function KanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const itineraryId = parseInt(id)

  const itineraryRaw = await prisma.itinerary.findFirst({
    where: { id: itineraryId, userId: parseInt(session.user.id as string) },
    include: {
      items: {
        include: { 
          destination: {
            include: { category: true }
          }
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!itineraryRaw || !itineraryRaw.isCanvas) {
    redirect('/profil?tab=itinerary')
  }

  const itinerary = {
    id: itineraryRaw.id,
    title: itineraryRaw.title,
    items: itineraryRaw.items.map((i: any) => ({
      id: i.id,
      destination: {
        id: i.destination.id,
        name: i.destination.name,
        mainImage: i.destination.mainImage,
        categoryName: i.destination.category?.name || 'Wisata',
        area: i.destination.area,
      }
    }))
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <KanvasClient itinerary={itinerary} />
      </div>
    </div>
  )
}
