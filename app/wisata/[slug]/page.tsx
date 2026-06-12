import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SafeImage from '@/components/ui/SafeImage'
import BookingButton from '@/components/ui/BookingButton'
import WishlistButton from '@/components/ui/WishlistButton'
import ItineraryPickerModal from '@/components/ui/ItineraryPickerModal'
import MapWrapper from '@/components/ui/MapWrapper'
import ReviewSection from '@/components/ui/ReviewSection'
import QnaSection from '@/components/ui/QnaSection'
import ImageGallery from '@/components/ui/ImageGallery'
import TransportEstimator from '@/components/ui/TransportEstimator'
import DistanceBadge from '@/components/ui/DistanceBadge'
import MenuImage from '@/components/ui/MenuImage'
import { getDetailHref } from '@/lib/categoryRoutes'
import {
  MapPin,
  Clock,
  Wallet,
  Star,
  Calendar,
  ArrowLeft,
  Navigation,
  Bus,
  Car,
  Bike,
  CheckCircle,
  Users,
  Share2,
  Heart,
  CalendarPlus,
  UtensilsCrossed,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dest = await prisma.destination.findUnique({ where: { slug }, include: { category: true } })
  if (!dest) return { title: 'Destinasi tidak ditemukan' }
  return {
    title: `${dest.name} — MLAKOOW Smart Tourism Surabaya`,
    description: dest.description.slice(0, 160),
  }
}

export default async function DetailDestinasiPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      },
    },
  })

  if (!destination) notFound()

  // Redirect guard — non-wisata slugs belong in their own category pages
  const WISATA_SLUGS = new Set(['wisata','alam','budaya','sejarah','keluarga','edukasi','petualangan','taman-rekreasi','hidden-gem'])
  if (!WISATA_SLUGS.has(destination.category.slug)) {
    const { getDetailHref } = await import('@/lib/categoryRoutes')
    redirect(getDetailHref(slug, destination.category.slug))
  }

  // Session & review status
  const session = await auth()
  const isLoggedIn = !!session?.user
  const currentUserId = session?.user ? parseInt(session.user.id as string) : undefined
  const hasReviewed = currentUserId
    ? destination.reviews.some(r => (r.user as any).id === currentUserId)
    : false

  // Related destinations (same category or area)
  const related = await prisma.destination.findMany({
    where: {
      OR: [{ categoryId: destination.categoryId }, { area: destination.area }],
      NOT: { id: destination.id },
    },
    include: { category: true },
    take: 4,
    orderBy: { rating: 'desc' },
  })

  const gallery: string[] = JSON.parse(destination.gallery || '[]')
  const facilities: string[] = JSON.parse(destination.facilities || '[]')
  let menus: any[] = []
  if (destination.menus) {
    try { menus = JSON.parse(destination.menus) } catch(e) {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Back nav */}
      {/* Interactive Gallery (hero + thumbnails + lightbox) */}
      <ImageGallery
        mainImage={destination.mainImage}
        gallery={gallery}
        altBase={destination.name}
        backLink="/wisata"
      />

      {/* Hero overlay info (name, badges, rating) — kept on top of gallery */}
      <div style={{ background: (destination.category.slug === 'hiburan' || destination.category.slug === 'spot-foto') ? 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)' : 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)', padding: '1.5rem 1.5rem 1.25rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: destination.category.color + '22', color: destination.category.color, border: `1px solid ${destination.category.color}44` }}>
              {destination.category.icon} {destination.category.name}
            </span>
            {destination.featured && (
              <span className="badge" style={{ background: '#FF6B35', color: 'white' }}>⭐ Populer</span>
            )}
            {destination.hiddenGem && (
              <span className="badge" style={{ background: '#7C3AED', color: 'white' }}>💎 Hidden Gem</span>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
            {destination.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={15} /> {destination.address}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Star size={15} fill="#F59E0B" color="#F59E0B" />
              <strong>{destination.rating > 0 ? destination.rating.toFixed(1) : 'Baru'}</strong>
              {destination.reviewCount > 0 && <span>({destination.reviewCount} review)</span>}
              <DistanceBadge lat={destination.lat} lng={destination.lng} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Quick info cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '1rem',
              }}
            >
              {[
                {
                  icon: Clock,
                  label: 'Jam Buka',
                  value: `${destination.openHour} – ${destination.closeHour}`,
                  color: '#0A4A5E',
                },
                {
                  icon: Wallet,
                  label: destination.ticketPrice === 0 ? 'Biaya Masuk' : 'Estimasi Biaya',
                  value: destination.ticketPrice === 0 ? 'Gratis' : `Rp ${destination.ticketPrice.toLocaleString('id-ID')}`,
                  color: destination.ticketPrice === 0 ? '#10B981' : '#0A4A5E',
                },
                {
                  icon: Calendar,
                  label: 'Estimasi Kunjungan',
                  value: `${destination.estimatedDuration} menit`,
                  color: '#F59E0B',
                },
                {
                  icon: MapPin,
                  label: 'Area',
                  value: destination.area,
                  color: '#7C3AED',
                },
              ].map((info) => (
                <div
                  key={info.label}
                  style={{
                    background: 'white',
                    border: '1px solid #E5E9F0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                  }}
                >
                  <info.icon size={20} color={info.color} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>{info.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: info.color }}>{info.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E9F0' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem' }}>
                Tentang {destination.name}
              </h2>
              <p style={{ color: '#4A5568', lineHeight: 1.9, fontSize: '0.95rem' }}>
                {destination.description}
              </p>
            </div>

            {/* Menu & Harga — hanya muncul jika ada data menus */}
            {menus.length > 0 && (
              <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E9F0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UtensilsCrossed size={20} color="#C0392B" /> Menu & Harga
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {menus.map((menu: any, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '1.25rem', borderBottom: index < menus.length - 1 ? '1px dashed #E5E9F0' : 'none', paddingBottom: index < menus.length - 1 ? '1.25rem' : '0' }}>
                      {menu.image ? (
                        <MenuImage src={menu.image} alt={menu.name} />
                      ) : (
                        <div style={{ flexShrink: 0, width: '72px', height: '72px', borderRadius: '12px', background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UtensilsCrossed size={22} color="#C0392B" />
                        </div>
                      )}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A2332', margin: 0 }}>{menu.name}</h4>
                          {menu.recommended && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '50px' }}>⭐ Rekomendasi</span>
                          )}
                        </div>
                        {menu.desc && (
                          <p style={{ fontSize: '0.85rem', color: '#8B98A9', margin: 0, lineHeight: 1.5 }}>{menu.desc}</p>
                        )}
                      </div>
                      <div style={{ fontWeight: 900, color: '#C0392B', fontSize: '1.05rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        Rp {menu.price?.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E9F0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1.25rem' }}>
                  Fasilitas Tersedia
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {facilities.map((fac) => (
                    <div
                      key={fac}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#F0F7FA',
                        border: '1px solid #BAE6FD',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '0.875rem',
                        color: '#0A4A5E',
                        fontWeight: 500,
                      }}
                    >
                      <CheckCircle size={14} color="#0A4A5E" />
                      {fac}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transport Estimator (Client Component) */}
            <TransportEstimator
              destinationLat={destination.lat}
              destinationLng={destination.lng}
            />

            {/* Map */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin fill="#EF4444" color="white" /> Lokasi
                </h2>
                <p style={{ color: '#4A5568', fontSize: '0.9rem', marginTop: '6px' }}>{destination.address}</p>
              </div>
              
              {/* Map container with isolated stacking to prevent Leaflet from breaking out of border-radius */}
              <div style={{ padding: '0 1.5rem' }}>
                <div style={{ height: '280px', position: 'relative', borderRadius: '16px', overflow: 'hidden', isolation: 'isolate', border: '1px solid #E5E9F0' }}>
                  <MapWrapper
                    pins={[{ lat: destination.lat, lng: destination.lng, label: destination.name }]}
                    zoom={16}
                  />
                </div>
              </div>

              <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex' }}>
                <a
                  href={`https://www.google.com/maps?q=${destination.lat},${destination.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Navigation size={16} />
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Booking Card */}
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #E5E9F0',
                boxShadow: '0 8px 30px rgba(10,74,94,0.08)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>
                  {destination.category.slug === 'hiburan' || destination.category.slug === 'spot-foto' ? 'ESTIMASI PENGELUARAN' : 'TIKET MASUK'}
                </div>
                <div style={{ fontSize: destination.category.slug === 'hiburan' || destination.category.slug === 'spot-foto' ? '1.5rem' : '2rem', fontWeight: 900, color: destination.ticketPrice === 0 ? '#10B981' : '#0A4A5E' }}>
                  {destination.ticketPrice === 0 ? 'GRATIS' : (
                    destination.category.slug === 'hiburan' || destination.category.slug === 'spot-foto'
                    ? `Rp ${destination.ticketPrice.toLocaleString('id-ID')} - ${(Math.round((destination.ticketPrice * 1.5) / 5000) * 5000).toLocaleString('id-ID')}`
                    : `Rp ${destination.ticketPrice.toLocaleString('id-ID')}`
                  )}
                </div>
                {destination.ticketPrice > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>per orang</div>
                )}
              </div>

              <WishlistButton
                destinationId={destination.id}
                style={{ marginBottom: '0.75rem' }}
              />

              {destination.ticketPrice > 0 && (
                <BookingButton
                  destinationId={destination.id}
                  destinationName={destination.name}
                  ticketPrice={destination.ticketPrice}
                />
              )}

              <ItineraryPickerModal
                destinationId={destination.id}
                destinationName={destination.name}
                destinationSlug={destination.slug}
                trigger={
                  <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.875rem', borderRadius: '14px', background: '#F0F7FA', border: '1.5px solid #BAE6FD', color: '#0A4A5E', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    <CalendarPlus size={16} /> Tambah ke Itinerary
                  </button>
                }
              />
            </div>


            {related.length > 0 && (
              <div
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  border: '1px solid #E5E9F0',
                }}
              >
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>
                  Destinasi Serupa
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={getDetailHref(rel.slug, rel.category?.slug ?? '')}
                      style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center' }}
                    >
                      <SafeImage
                        src={rel.mainImage}
                        alt={rel.name}
                        style={{ width: '68px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', marginBottom: '2px' }}
                          className="line-clamp-2"
                        >
                          {rel.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#8B98A9' }}>
                          <Star size={11} fill="#F59E0B" color="#F59E0B" />
                          <span>{rel.rating > 0 ? rel.rating.toFixed(1) : 'Baru'}</span>
                          <span>•</span>
                          <span>{rel.area.replace('Surabaya ', 'Sby ')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More destinations */}
      {related.length > 0 && (
        <div style={{ background: 'white', padding: '3rem 0', borderTop: '1px solid #E5E9F0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
            <Link href="/wisata" className="btn-primary" style={{ fontSize: '1rem' }}>
              Lihat Semua Destinasi Surabaya
            </Link>
          </div>
        </div>
      )}

      <ReviewSection
        destinationId={destination.id}
        destinationName={destination.name}
        initialReviews={destination.reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          userId: r.user.id,
          user: { name: r.user.name, avatar: null },
          ownerReply: (r as any).ownerReply,
          ownerReplyAt: (r as any).ownerReplyAt ? new Date((r as any).ownerReplyAt).toISOString() : null,
        }))}
        initialRating={destination.rating}
        initialCount={destination.reviewCount}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        hasReviewed={hasReviewed}
      />

      <QnaSection
        destinationId={destination.id}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
      />

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}
