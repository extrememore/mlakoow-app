import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SafeImage from '@/components/ui/SafeImage'
import MapWrapper from '@/components/ui/MapWrapper'
import ReviewSection from '@/components/ui/ReviewSection'
import QnaSection from '@/components/ui/QnaSection'
import ImageGallery from '@/components/ui/ImageGallery'
import TransportEstimator from '@/components/ui/TransportEstimator'
import DistanceBadge from '@/components/ui/DistanceBadge'
import WishlistButton from '@/components/ui/WishlistButton'
import ItineraryPickerModal from '@/components/ui/ItineraryPickerModal'
import { getDetailHref } from '@/lib/categoryRoutes'
import {
  MapPin,
  Clock,
  Wallet,
  Star,
  Calendar,
  Navigation,
  CheckCircle,
  Gamepad2,
  CalendarPlus,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dest = await prisma.destination.findUnique({ where: { slug }, include: { category: true } })
  if (!dest) return { title: 'Destinasi tidak ditemukan' }
  return {
    title: `${dest.name} — Hiburan Surabaya | MLAKOOW`,
    description: dest.description.slice(0, 160),
  }
}

export default async function DetailHiburanPage({
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

  // Only hiburan & spot-foto belong here
  if (destination.category.slug !== 'hiburan' && destination.category.slug !== 'spot-foto') {
    redirect(`/wisata/${slug}`)
  }

  const session = await auth()
  const isLoggedIn = !!session?.user
  const currentUserId = session?.user ? parseInt(session.user.id as string) : undefined
  const hasReviewed = currentUserId
    ? destination.reviews.some(r => (r.user as any).id === currentUserId)
    : false

  const related = await prisma.destination.findMany({
    where: {
      categoryId: destination.categoryId,
      NOT: { id: destination.id },
    },
    include: { category: true },
    take: 4,
    orderBy: { rating: 'desc' },
  })

  const gallery: string[] = JSON.parse(destination.gallery || '[]')
  const facilities: string[] = JSON.parse(destination.facilities || '[]')

  const priceUpper = Math.round((destination.ticketPrice * 1.5) / 5000) * 5000

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      <ImageGallery
        mainImage={destination.mainImage}
        gallery={gallery}
        altBase={destination.name}
        backLink="/hiburan"
      />

      {/* Hero info bar — Orange theme */}
      <div style={{ background: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)', padding: '1.5rem 1.5rem 1.25rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
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
              <Star size={15} fill="#FEF3C7" color="#FEF3C7" />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {[
                {
                  icon: Clock,
                  label: 'Jam Buka',
                  value: `${destination.openHour} – ${destination.closeHour}`,
                  color: '#B45309',
                },
                {
                  icon: Wallet,
                  label: 'Estimasi Pengeluaran',
                  value: destination.ticketPrice === 0 ? 'Gratis' : `Rp ${destination.ticketPrice.toLocaleString('id-ID')} – Rp ${priceUpper.toLocaleString('id-ID')}`,
                  color: destination.ticketPrice === 0 ? '#10B981' : '#B45309',
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
                  style={{ background: 'white', border: '1px solid #E5E9F0', borderRadius: '16px', padding: '1.25rem' }}
                >
                  <info.icon size={20} color={info.color} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>{info.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: info.color }}>{info.value}</div>
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
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: '10px', padding: '8px 14px', fontSize: '0.875rem', color: '#92400E', fontWeight: 500 }}
                    >
                      <CheckCircle size={14} color="#B45309" />
                      {fac}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            {/* Price & Action Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', boxShadow: '0 8px 30px rgba(180,83,9,0.08)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>ESTIMASI PENGELUARAN</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: destination.ticketPrice === 0 ? '#10B981' : '#B45309' }}>
                  {destination.ticketPrice === 0
                    ? 'GRATIS'
                    : `Rp ${destination.ticketPrice.toLocaleString('id-ID')} – Rp ${priceUpper.toLocaleString('id-ID')}`}
                </div>
                {destination.ticketPrice > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>estimasi per orang</div>
                )}
              </div>

              <WishlistButton
                destinationId={destination.id}
                style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', marginBottom: '0.75rem' }}
              />

              <ItineraryPickerModal
                destinationId={destination.id}
                destinationName={destination.name}
                destinationSlug={destination.slug}
                trigger={
                  <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.875rem', borderRadius: '14px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                    <CalendarPlus size={18} /> Tambah ke Itinerary
                  </button>
                }
              />
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>
                  🎮 Hiburan Serupa
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
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', marginBottom: '2px' }} className="line-clamp-2">
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

      <div style={{ background: 'white', padding: '3rem 0', borderTop: '1px solid #E5E9F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <Link
            href="/hiburan"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #B45309, #F59E0B)', color: 'white', borderRadius: '50px', padding: '0.9rem 2rem', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}
          >
            <Gamepad2 size={18} />
            Lihat Semua Hiburan Surabaya
          </Link>
        </div>
      </div>

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
    </div>
  )
}
