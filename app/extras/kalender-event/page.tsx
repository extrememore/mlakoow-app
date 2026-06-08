import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, MapPin, Search } from 'lucide-react'
import EventBookmarkButton from '@/components/ui/EventBookmarkButton'

export const dynamic = 'force-dynamic'

export default async function KalenderEventPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  const userId = session?.user ? parseInt(session.user.id as string) : null

  const resolvedParams = await searchParams
  const search = resolvedParams?.search || ''
  const category = resolvedParams?.category || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ]
  }
  if (category && category !== 'Semua') {
    where.category = category
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
  })

  // Get saved events for user
  const savedEvents = userId ? await prisma.savedEvent.findMany({
    where: { userId },
    select: { eventId: true }
  }) : []
  const savedEventIds = savedEvents.map(s => s.eventId)

  const allCategories = ['Semua', 'Festival', 'Pameran', 'Musik', 'Budaya', 'Seni']

  const getStatusBadge = (startDate: Date, endDate: Date) => {
    const now = new Date()
    if (now > endDate) {
      return <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Berakhir</span>
    } else if (now >= startDate && now <= endDate) {
      return <span style={{ background: '#D1FAE5', color: '#047857', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Sedang Berlangsung</span>
    } else {
      return <span style={{ background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Akan Datang</span>
    }
  }

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

        {/* Content */}
        <div style={{ maxWidth: '1000px', margin: '-2rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          
          {/* Filters & Search */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <form method="GET" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <Search size={18} color="#8B98A9" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  name="search" 
                  defaultValue={search}
                  placeholder="Cari nama atau deskripsi event..." 
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px', border: '1px solid #E5E9F0', fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
                {allCategories.map(cat => {
                  const isActive = (category === cat) || (!category && cat === 'Semua')
                  return (
                    <button 
                      key={cat}
                      name="category"
                      value={cat}
                      type="submit"
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '50px',
                        border: 'none',
                        background: isActive ? '#0A4A5E' : '#F0F4F8',
                        color: isActive ? 'white' : '#4A5568',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </form>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {events.length === 0 ? (
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                Tidak ada event yang ditemukan untuk filter tersebut.
              </div>
            ) : (
              events.map((event) => {
                const isSaved = savedEventIds.includes(event.id)
                // Generate Google Calendar Link
                const startStr = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
                const endStr = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
                const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`

                return (
                  <div key={event.id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'row', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} className="event-card">
                    <div style={{ width: '300px', height: 'auto', minHeight: '250px', flexShrink: 0 }}>
                      <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {getStatusBadge(event.startDate, event.endDate)}
                          <span style={{ background: '#E0F2FE', color: '#0A4A5E', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {event.category}
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, color: '#FF6B35', fontSize: '1rem' }}>
                          {event.price}
                        </span>
                      </div>
                      
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>{event.title}</h2>
                      
                      <p style={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>
                        {event.description}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', color: '#8B98A9', fontSize: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={16} color="#0A4A5E" />
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} color="#FF6B35" />
                          {event.location}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid #E5E9F0', paddingTop: '1.25rem', marginTop: 'auto' }}>
                        <a 
                          href={gCalLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            background: '#0A4A5E',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            borderRadius: '50px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Calendar size={14} /> Add to Calendar
                        </a>
                        
                        <EventBookmarkButton eventId={event.id} initiallySaved={isSaved} sessionExists={!!session?.user} />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .event-card { flex-direction: column !important; }
          .event-card > div:first-child { width: 100% !important; min-height: 200px !important; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}
