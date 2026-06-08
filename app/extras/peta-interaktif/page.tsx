import { prisma } from '@/lib/prisma'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import InteractiveMapClient from '@/components/ui/InteractiveMapClient'
import type { MapPin } from '@/components/ui/MapDisplay'

export const dynamic = 'force-dynamic'

export default async function PetaInteraktifPage() {
  const [destinations, events] = await Promise.all([
    prisma.destination.findMany({ include: { category: true } }),
    prisma.event.findMany()
  ])

  const now = new Date()

  // Convert Destinations to MapPin
  const destinationPins: MapPin[] = destinations.map(d => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    label: d.name,
    type: 'destination',
    category: d.category.name,
    image: d.mainImage,
    address: d.address,
    slug: d.slug
  }))

  // Convert Events to MapPin
  const eventPins: MapPin[] = events.map(e => {
    // Extract dummy lat/lng from location string or randomize slightly around Surabaya center if no explicit coords
    // In a real app, Events would have lat/lng columns in DB. For now, we simulate it.
    // If we don't have coords, we fallback to a simulated coordinate in Surabaya.
    // Since prisma schema doesn't have lat/lng for Event, we will mock them for demonstration
    // based on event id to keep it consistent.
    const mockLat = -7.250445 + (e.id * 0.005) * (e.id % 2 === 0 ? 1 : -1)
    const mockLng = 112.768845 + (e.id * 0.005) * (e.id % 3 === 0 ? 1 : -1)

    const startDate = new Date(e.startDate)
    const endDate = new Date(e.endDate)
    const isLive = now >= startDate && now <= endDate

    return {
      id: e.id,
      lat: mockLat,
      lng: mockLng,
      label: e.title,
      type: 'event',
      category: e.category,
      image: e.image,
      address: e.location,
      slug: e.slug,
      isLiveEvent: isLive
    }
  })

  const allPins = [...destinationPins, ...eventPins]

  // Extract unique categories for the filter
  const allCategories = Array.from(new Set(allPins.map(p => p.category).filter(Boolean))) as string[]

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'white', padding: '2rem 1.5rem', borderBottom: '1px solid #E5E9F0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '0.25rem' }}>Peta Interaktif Surabaya</h1>
              <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Eksplorasi {destinations.length} destinasi wisata dan {events.length} event menarik di sekitar Anda</p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px', background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <InteractiveMapClient initialPins={allPins} categories={allCategories} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
