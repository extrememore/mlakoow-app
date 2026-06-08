import { prisma } from '@/lib/prisma'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, MapPin, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function KalenderEventPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'asc' },
  })

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0A4A5E 0%, #FF6B35 100%)', padding: '4rem 1.5rem', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Kalender Event</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Temukan berbagai festival, pameran, dan acara menarik yang sedang dan akan berlangsung di Surabaya.
          </p>
        </div>

        {/* Event List */}
        <div style={{ maxWidth: '1000px', margin: '-2rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {events.length === 0 ? (
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                Belum ada event yang dijadwalkan saat ini.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'row', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} className="event-card">
                  <div style={{ width: '300px', height: '220px', flexShrink: 0 }}>
                    <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ background: '#E0F2FE', color: '#0A4A5E', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {event.category}
                      </span>
                      <span style={{ fontWeight: 700, color: '#FF6B35', fontSize: '0.9rem' }}>
                        {event.price}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>{event.title}</h2>
                    <p style={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>
                      {event.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', color: '#8B98A9', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} />
                        {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .event-card { flex-direction: column !important; }
          .event-card > div:first-child { width: 100% !important; height: 200px !important; }
        }
      `}</style>
    </>
  )
}
