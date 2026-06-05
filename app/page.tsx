import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DestinationCard from '@/components/ui/DestinationCard'
import CTAJoin from '@/components/ui/CTAJoin'
import NearbyRecommendations from '@/components/ui/NearbyRecommendations'
import {
  Search,
  MapPin,
  Compass,
  Zap,
  ArrowRight,
  Star,
  Users,
  Calendar,
  ChevronRight,
} from 'lucide-react'

export default async function HomePage() {

  const [featuredDestinations, hiddenGems, categories, totalDestinations, allDestinations] =
    await Promise.all([
      prisma.destination.findMany({
        where: { featured: true },
        include: { category: true },
        orderBy: { rating: 'desc' },
        take: 6,
      }),
      prisma.destination.findMany({
        where: { hiddenGem: true },
        include: { category: true },
        orderBy: { rating: 'desc' },
        take: 4,
      }),
      prisma.category.findMany(),
      prisma.destination.count(),
      prisma.destination.findMany({
        include: { category: true }
      }),
    ])

  const areas = [
    {
      name: 'Surabaya Utara',
      emoji: '🕌',
      desc: 'Kawasan bersejarah Kota Lama & Kampung Arab',
      color: '#0A4A5E',
      bg: 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=400&q=80',
    },
    {
      name: 'Surabaya Pusat',
      emoji: '🏙️',
      desc: 'Pusat kota modern & ikon Surabaya',
      color: '#FF6B35',
      bg: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80',
    },
    {
      name: 'Surabaya Timur',
      emoji: '🌊',
      desc: 'Pantai, taman kota & hiburan keluarga',
      color: '#10B981',
      bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    },
    {
      name: 'Surabaya Selatan',
      emoji: '🌿',
      desc: 'Taman hijau, kuliner & lifestyle modern',
      color: '#7C3AED',
      bg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
    },
    {
      name: 'Surabaya Barat',
      emoji: '🛍️',
      desc: 'Kawasan residensial, mall & kuliner kekinian',
      color: '#F59E0B',
      bg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    },
  ]

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    alam: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
    budaya: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
    kuliner: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
    sejarah: { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
    keluarga: { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
    'hidden-gem': { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ===================== HERO ===================== */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background:
            'linear-gradient(135deg, #062E3A 0%, #0A4A5E 40%, #0D6E84 80%, #0A4A5E 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(6,46,58,0.95) 0%, rgba(10,74,94,0.85) 50%, rgba(255,107,53,0.15) 100%)',
          }}
        />

        {/* Floating elements */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,110,132,0.2) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem',
            position: 'relative',
            zIndex: 2,
            width: '100%',
          }}
        >
          <div style={{ maxWidth: '700px' }}>
            {/* Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,107,53,0.15)',
                border: '1px solid rgba(255,107,53,0.3)',
                borderRadius: '50px',
                padding: '8px 18px',
                marginBottom: '2rem',
                color: '#FF8C5E',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <MapPin size={14} />
              Smart Tourism Hyperlocal Surabaya
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                letterSpacing: '-1px',
              }}
            >
              Jelajahi Surabaya{' '}
              <span style={{ color: '#FF6B35' }}>Lebih Cerdas</span>
              {' '}& Menyenangkan
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.8,
                marginBottom: '2.5rem',
                maxWidth: '560px',
              }}
            >
              Temukan destinasi tersembunyi, rencanakan itinerary efisien, dan nikmati pengalaman wisata Surabaya yang tak terlupakan — semuanya dalam satu platform.
            </p>

            {/* Search bar */}
            <form action="/destinasi" method="GET" style={{ marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  maxWidth: '560px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0 1.25rem',
                    flex: 1,
                  }}
                >
                  <Search size={20} color="#8B98A9" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Cari destinasi, area, atau kategori..."
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      padding: '1.1rem 0',
                      fontSize: '0.95rem',
                      fontFamily: 'Outfit, sans-serif',
                      color: '#1A2332',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ borderRadius: '12px', margin: '6px', padding: '0 1.5rem' }}
                >
                  Cari
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/destinasi"
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E5522A)' }}
              >
                <Compass size={18} />
                Mulai Eksplorasi
              </Link>
              <Link
                href="/itinerary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '50px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '0.95rem',
                }}
              >
                <Zap size={18} />
                Smart Itinerary
              </Link>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: '2.5rem',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: MapPin, value: `${totalDestinations}+`, label: 'Destinasi' },
                { icon: Star, value: '4.8', label: 'Rating Rata-rata' },
                { icon: Users, value: '500+', label: 'Wisatawan Puas' },
                { icon: Calendar, value: '5 Area', label: 'Wilayah Surabaya' },
              ].map((stat) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(255,107,53,0.15)',
                      border: '1px solid rgba(255,107,53,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <stat.icon size={18} color="#FF8C5E" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== KATEGORI ===================== */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#E0F2FE',
                color: '#0A4A5E',
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1rem',
                letterSpacing: '0.5px',
              }}
            >
              KATEGORI WISATA
            </span>
            <h2 className="section-title">Temukan Wisata Sesuai Minat</h2>
            <p style={{ color: '#4A5568', marginTop: '0.75rem', fontSize: '1rem' }}>
              Pilih kategori yang kamu inginkan dan mulai petualangan di Surabaya
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {categories.map((cat) => {
              const colors = categoryColors[cat.slug] || { bg: '#F0F4F8', text: '#4A5568', border: '#CBD5E0' }
              return (
                <Link
                  key={cat.id}
                  href={`/destinasi?category=${cat.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card-hover"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '20px',
                      padding: '1.75rem 1.25rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                    <div style={{ fontWeight: 700, color: colors.text, fontSize: '0.95rem' }}>{cat.name}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===================== WISATA TERDEKAT (LOCATION BASED) ===================== */}
      <NearbyRecommendations destinations={allDestinations} />

      {/* ===================== DESTINASI POPULER ===================== */}
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: '#FEF3C7',
                  color: '#B45309',
                  padding: '6px 16px',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                ⭐ PALING POPULER
              </span>
              <h2 className="section-title">Destinasi Favorit Wisatawan</h2>
              <p style={{ color: '#4A5568', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Tempat-tempat terbaik yang wajib dikunjungi di Surabaya
              </p>
            </div>
            <Link
              href="/destinasi?featured=true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                color: '#0A4A5E',
                fontWeight: 600,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
            >
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          {featuredDestinations.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {featuredDestinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  id={dest.id}
                  name={dest.name}
                  slug={dest.slug}
                  area={dest.area}
                  mainImage={dest.mainImage}
                  rating={dest.rating}
                  reviewCount={dest.reviewCount}
                  ticketPrice={dest.ticketPrice}
                  featured={dest.featured}
                  hiddenGem={dest.hiddenGem}
                  estimatedDuration={dest.estimatedDuration}
                  category={dest.category}
                  description={dest.description}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                background: '#F8F6F2',
                borderRadius: '20px',
                color: '#8B98A9',
              }}
            >
              <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Data destinasi belum tersedia. Jalankan seed data terlebih dahulu.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <code>npx prisma db seed</code>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===================== SMART ITINERARY CTA ===================== */}
      <section
        style={{
          padding: '6rem 0',
          background: 'linear-gradient(135deg, #0A4A5E 0%, #0D6E84 50%, #062E3A 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 60%)',
          }}
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,107,53,0.15)',
                  border: '1px solid rgba(255,107,53,0.3)',
                  color: '#FF8C5E',
                  padding: '6px 16px',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  letterSpacing: '0.5px',
                }}
              >
                <Zap size={13} />
                FITUR UNGGULAN
              </span>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1.2,
                  marginBottom: '1rem',
                }}
              >
                Smart Itinerary — <span style={{ color: '#FF6B35' }}>Rencana Trip</span> Dalam Hitungan Detik
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '580px', marginBottom: '2rem' }}>
                Masukkan preferensi perjalanan kamu — durasi, budget, dan minat — dan biarkan MLAKOOW menyusun itinerary efisien yang mengoptimalkan rute, waktu, dan biaya kamu di Surabaya.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {['📍 Grouping by area', '⏰ Slot waktu otomatis', '💰 Estimasi budget', '🚌 Rekomendasi transport'].map(
                  (feat) => (
                    <div
                      key={feat}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      }}
                    >
                      {feat}
                    </div>
                  )
                )}
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <Link href="/itinerary" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                <Zap size={20} />
                Buat Itinerary Sekarang
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HIDDEN GEMS ===================== */}
      {hiddenGems.length > 0 && (
        <section style={{ padding: '5rem 0', background: '#F8F6F2' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#EDE9FE',
                    color: '#5B21B6',
                    padding: '6px 16px',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  💎 HIDDEN GEMS
                </span>
                <h2 className="section-title">Permata Tersembunyi Surabaya</h2>
                <p style={{ color: '#4A5568', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                  Tempat-tempat autentik yang belum banyak diketahui wisatawan
                </p>
              </div>
              <Link
                href="/destinasi?hiddenGem=true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: '#5B21B6',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                Lihat Semua <ChevronRight size={16} />
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {hiddenGems.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  id={dest.id}
                  name={dest.name}
                  slug={dest.slug}
                  area={dest.area}
                  mainImage={dest.mainImage}
                  rating={dest.rating}
                  reviewCount={dest.reviewCount}
                  ticketPrice={dest.ticketPrice}
                  featured={dest.featured}
                  hiddenGem={dest.hiddenGem}
                  estimatedDuration={dest.estimatedDuration}
                  category={dest.category}
                  description={dest.description}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== AREA SURABAYA ===================== */}
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#DCFCE7',
                color: '#15803D',
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
                letterSpacing: '0.5px',
              }}
            >
              🗺️ AREA SURABAYA
            </span>
            <h2 className="section-title">Jelajahi 5 Wilayah Surabaya</h2>
            <p style={{ color: '#4A5568', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Setiap area punya karakteristik wisata yang unik dan menarik
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {areas.map((area) => (
              <Link
                key={area.name}
                href={`/destinasi?area=${encodeURIComponent(area.name)}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="card-hover"
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    height: '200px',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={area.bg}
                    alt={area.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(to top, ${area.color}EE 0%, ${area.color}44 60%, transparent 100%)`,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1.25rem',
                      color: 'white',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{area.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{area.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85, lineHeight: 1.4 }}>{area.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA JOIN ===================== */}
      <CTAJoin />

      <Footer />
    </div>
  )
}
