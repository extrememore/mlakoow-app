import { prisma } from '@/lib/prisma'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MapWrapper from '@/components/ui/MapWrapper'

export const dynamic = 'force-dynamic'

export default async function PetaInteraktifPage() {
  const destinations = await prisma.destination.findMany({
    include: { category: true }
  })

  const mapPins = destinations.map(d => ({
    lat: d.lat,
    lng: d.lng,
    label: d.name,
    order: undefined,
  }))

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'white', padding: '2rem 1.5rem', borderBottom: '1px solid #E5E9F0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '0.25rem' }}>Peta Interaktif Surabaya</h1>
              <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Eksplorasi {destinations.length} destinasi wisata secara geografis</p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ height: 'calc(100vh - 250px)', minHeight: '500px', background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <MapWrapper pins={mapPins} height="100%" zoom={12} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
