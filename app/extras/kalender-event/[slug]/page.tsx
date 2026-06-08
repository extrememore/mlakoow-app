import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, MapPin, ArrowLeft, Tag } from 'lucide-react'
import EventBookmarkButton from '@/components/ui/EventBookmarkButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  const userId = session?.user ? parseInt(session.user.id as string) : null

  const resolvedParams = await params

  const event = await prisma.event.findUnique({
    where: { slug: resolvedParams.slug }
  })

  if (!event) return notFound()

  const isSaved = userId ? !!(await prisma.savedEvent.findFirst({
    where: { userId, eventId: event.id }
  })) : false

  const startStr = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
  const endStr = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
  const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`

  const getStatusBadge = (startDate: Date, endDate: Date) => {
    const now = new Date()
    if (now > endDate) {
      return <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700 }}>Berakhir</span>
    } else if (now >= startDate && now <= endDate) {
      return <span style={{ background: '#D1FAE5', color: '#047857', padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700 }}>Sedang Berlangsung</span>
    } else {
      return <span style={{ background: '#FEF3C7', color: '#B45309', padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700 }}>Akan Datang</span>
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '4rem' }}>
        <div style={{ background: '#1A2332', height: '350px', position: 'relative' }}>
          <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1A2332, transparent)' }} />
          <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
            <Link href="/extras/kalender-event" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '50px', backdropFilter: 'blur(10px)' }}>
              <ArrowLeft size={18} /> Kembali ke Kalender
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '-100px auto 0', position: 'relative', zIndex: 10, padding: '0 1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {getStatusBadge(event.startDate, event.endDate)}
                <span style={{ background: '#E0F2FE', color: '#0A4A5E', padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={14} /> {event.category}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a 
                  href={gCalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    background: '#0A4A5E', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Calendar size={16} /> Add to Calendar
                </a>
                <EventBookmarkButton eventId={event.id} initiallySaved={isSaved} sessionExists={!!session?.user} />
              </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1A2332', marginBottom: '1.5rem', lineHeight: 1.2 }}>{event.title}</h1>

            <div style={{ display: 'flex', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #E5E9F0', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: '#FFF7ED', color: '#FF6B35', padding: '12px', borderRadius: '12px' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 600, marginBottom: '2px' }}>Tanggal Acara</div>
                  <div style={{ fontWeight: 700, color: '#1A2332' }}>
                    {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: '#F0FDF4', color: '#10B981', padding: '12px', borderRadius: '12px' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 600, marginBottom: '2px' }}>Lokasi</div>
                  <div style={{ fontWeight: 700, color: '#1A2332' }}>{event.location}</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>Harga Tiket</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF6B35' }}>{event.price}</div>
              </div>
              <button className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Pesan Sekarang</button>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem' }}>Deskripsi Acara</h2>
              <div style={{ color: '#4A5568', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                {event.description}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
