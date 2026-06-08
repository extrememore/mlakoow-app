import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, MapPin, Search } from 'lucide-react'
import EventBookmarkButton from '@/components/ui/EventBookmarkButton'
import SortSelect from '@/components/ui/SortSelect'
import Link from 'next/link'

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
  const sort = resolvedParams?.sort || 'Terdekat'

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

  let events = await prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' }, // default sort
  })

  // Parse price logic for sorting
  const parsePrice = (priceStr: string) => {
    if (!priceStr || priceStr.toLowerCase().includes('gratis')) return 0
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''))
    return isNaN(num) ? 0 : num
  }

  // Handle Sort
  if (sort === 'Termurah') {
    events.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  } else if (sort === 'Termahal') {
    events.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
  } else if (sort === 'Gratis') {
    events = events.filter(e => parsePrice(e.price) === 0)
  }

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
      <main style={{ minHeight: '100vh', background: '#F4F7F6', paddingBottom: '4rem' }}>
        {/* Header - Rich Aesthetics */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1A2332 0%, #0A4A5E 100%)', padding: '6rem 1.5rem 5rem', color: 'white', textAlign: 'center', overflow: 'hidden' }}>
          {/* Decorative Pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#FF6B35 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: '#FF6B35', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.3 }} />
          <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: '#0D6E84', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5 }} />
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>Kalender Event</h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Temukan berbagai festival, pameran, dan acara menarik yang sedang dan akan berlangsung di Surabaya.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1100px', margin: '-3rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          
          {/* Filters & Search Bar */}
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(10,74,94,0.1)', marginBottom: '3rem', border: '1px solid rgba(229,233,240,0.8)' }}>
            <form method="GET" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 250px', position: 'relative' }}>
                <Search size={20} color="#8B98A9" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  name="search" 
                  defaultValue={search}
                  placeholder="Cari nama atau deskripsi event..." 
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', borderRadius: '16px', border: '1px solid #E5E9F0', fontSize: '1rem', fontFamily: 'Outfit, sans-serif', background: '#F8FAFC', transition: 'all 0.2s' }} 
                  className="search-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <SortSelect defaultValue={sort} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', flex: '1 1 100%' }} className="hide-scrollbar">
                {allCategories.map(cat => {
                  const isActive = (category === cat) || (!category && cat === 'Semua')
                  return (
                    <button 
                      key={cat}
                      name="category"
                      value={cat}
                      type="submit"
                      style={{
                        padding: '0.7rem 1.4rem',
                        borderRadius: '50px',
                        border: isActive ? 'none' : '1px solid #E5E9F0',
                        background: isActive ? '#0A4A5E' : 'white',
                        color: isActive ? 'white' : '#4A5568',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 4px 12px rgba(10,74,94,0.2)' : 'none'
                      }}
                      className="category-btn"
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </form>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            {events.length === 0 ? (
              <div style={{ background: 'white', padding: '5rem 2rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '2px dashed #E5E9F0' }}>
                <Calendar size={48} color="#E5E9F0" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>Tidak ada event ditemukan</h3>
                <p style={{ color: '#8B98A9' }}>Coba ubah filter, urutan, atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              events.map((event) => {
                const isSaved = savedEventIds.includes(event.id)
                const startStr = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
                const endStr = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
                const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`

                return (
                  <div key={event.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'row', boxShadow: '0 4px 20px rgba(10,74,94,0.04)', border: '1px solid #E5E9F0', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} className="event-card">
                    <div style={{ width: '320px', height: 'auto', minHeight: '280px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      <Link href={`/extras/kalender-event/${event.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="event-image" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)', opacity: 0, transition: 'opacity 0.3s ease' }} className="image-overlay" />
                      </Link>
                    </div>
                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          {getStatusBadge(event.startDate, event.endDate)}
                          <span style={{ background: '#E0F2FE', color: '#0A4A5E', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {event.category}
                          </span>
                        </div>
                        <span style={{ fontWeight: 900, color: '#FF6B35', fontSize: '1.1rem' }}>
                          {event.price}
                        </span>
                      </div>
                      
                      <Link href={`/extras/kalender-event/${event.slug}`} style={{ textDecoration: 'none' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '0.75rem', lineHeight: 1.2, transition: 'color 0.2s' }} className="event-title">{event.title}</h2>
                      </Link>
                      
                      <p style={{ color: '#4A5568', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 }}>
                        {event.description}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', color: '#8B98A9', fontSize: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#0A4A5E" />
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#FF6B35" />
                          {event.location}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid #F0F4F8', paddingTop: '1.5rem', marginTop: 'auto' }}>
                        <a 
                          href={gCalLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            background: '#0A4A5E',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '10px 20px',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background 0.2s, transform 0.2s'
                          }}
                          className="btn-add-cal"
                        >
                          <Calendar size={16} /> Add to Calendar
                        </a>
                        
                        <EventBookmarkButton eventId={event.id} initiallySaved={isSaved} sessionExists={!!session?.user} />
                        
                        <Link 
                          href={`/extras/kalender-event/${event.slug}`}
                          style={{
                            marginLeft: 'auto',
                            color: '#0A4A5E',
                            fontWeight: 800,
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'color 0.2s'
                          }}
                          className="btn-detail"
                        >
                          Lihat Detail <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
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
          .event-card > div:first-child { width: 100% !important; min-height: 220px !important; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .search-input:focus { outline: none; border-color: #0A4A5E !important; box-shadow: 0 0 0 3px rgba(10,74,94,0.1); background: white !important; }
        .category-btn:hover { transform: translateY(-2px); }
        
        .event-card:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(10,74,94,0.1) !important; }
        .event-card:hover .event-image { transform: scale(1.05); }
        .event-card:hover .image-overlay { opacity: 1 !important; }
        .event-title:hover { color: #FF6B35 !important; }
        .btn-add-cal:hover { background: #083B4C !important; transform: scale(1.02); }
        .btn-detail:hover { color: #FF6B35 !important; }
      `}</style>
    </>
  )
}
