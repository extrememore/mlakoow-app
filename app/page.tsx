import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DestinationCard from '@/components/ui/DestinationCard'
import CTAJoin from '@/components/ui/CTAJoin'
import NearbyRecommendations from '@/components/ui/NearbyRecommendations'
import HeroCarousel from '@/components/ui/HeroCarousel'

export const dynamic = 'force-dynamic'

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
  Heart,
  Map,
  Sparkles,
  Ticket
} from 'lucide-react'

export default async function HomePage() {

  const [featuredDestinations, hiddenGems, categories, totalDestinations, allDestinations, upcomingEvents] =
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
      prisma.event.findMany({
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 3,
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

  // Feature list
  const features = [
    {
      title: 'Peta Interaktif',
      desc: 'Temukan destinasi wisata, kuliner, dan fasilitas di sekitarmu dengan mudah.',
      icon: Map,
      color: '#0A4A5E',
      link: '/extras/peta-interaktif'
    },
    {
      title: 'Smart Itinerary',
      desc: 'Buat rencana perjalanan otomatis dan optimal dengan AI MLAKOOW.',
      icon: Zap,
      color: '#FF6B35',
      link: '/itinerary'
    },
    {
      title: 'Kalender Event',
      desc: 'Jangan lewatkan festival, pameran, dan acara menarik di Surabaya.',
      icon: Calendar,
      color: '#10B981',
      link: '/extras/kalender-event'
    },
    {
      title: 'Hidden Gems',
      desc: 'Jelajahi surga tersembunyi yang belum banyak diketahui wisatawan.',
      icon: Sparkles,
      color: '#7C3AED',
      link: '/wisata?tag=hidden'
    },
    {
      title: 'Wishlist Destinasi',
      desc: 'Simpan tempat impianmu dan bagikan rencana liburan dengan teman.',
      icon: Heart,
      color: '#E11D48',
      link: '/wishlist'
    },
    {
      title: 'Booking Tiket',
      desc: 'Pesan tiket destinasi dan bayar langsung dari aplikasi tanpa ribet.',
      icon: Ticket,
      color: '#F59E0B',
      link: '/booking'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ===================== HERO REDESIGNED ===================== */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 40%, #0D6E84 80%, #0A4A5E 100%)',
          overflow: 'hidden',
          paddingTop: '80px',
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
            opacity: 0.12,
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(6,46,58,0.95) 0%, rgba(10,74,94,0.85) 50%, rgba(255,107,53,0.15) 100%)',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ maxWidth: '700px', paddingBottom: '3rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,107,53,0.15)',
                  border: '1px solid rgba(255,107,53,0.3)',
                  borderRadius: '50px',
                  padding: '8px 18px',
                  marginBottom: '1.5rem',
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
                Eksplorasi Surabaya <br/>
                <span style={{ color: '#FF6B35' }} className="typewriter">Lebih Menyenangkan.</span>
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
                Satu aplikasi untuk semua kebutuhan wisatamu. Cari tempat keren, buat itinerary cerdas, hingga temukan event seru di sekitarmu.
              </p>

              {/* Search bar */}
              <form action="/wisata" method="GET" style={{ marginBottom: '2.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    maxWidth: '560px',
                    border: '4px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 1.25rem', flex: 1 }}>
                    <Search size={20} color="#8B98A9" />
                    <input
                      name="search"
                      type="text"
                      placeholder="Cari destinasi wisata atau kuliner..."
                      style={{ border: 'none', outline: 'none', width: '100%', padding: '1.2rem 0', fontSize: '1rem', fontFamily: 'Outfit, sans-serif', color: '#1A2332' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ borderRadius: '12px', margin: '6px', padding: '0 1.5rem', background: '#FF6B35' }}>
                    Cari
                  </button>
                </div>
              </form>

              {/* Quick links */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href="/itinerary" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '50px', backdropFilter: 'blur(10px)', transition: 'background 0.3s' }} className="hover-bg-white-20">
                  <Zap size={16} color="#FF6B35" /> Buat Itinerary
                </Link>
                <Link href="/extras/peta-interaktif" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '50px', backdropFilter: 'blur(10px)', transition: 'background 0.3s' }} className="hover-bg-white-20">
                  <Map size={16} color="#10B981" /> Peta Interaktif
                </Link>
              </div>
            </div>

            {/* Desktop Hero Image / Floating elements */}
            <div className="hero-images" style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <HeroCarousel destinations={featuredDestinations} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FITUR UTAMA ===================== */}
      <section style={{ padding: '6rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
             <span style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.5px' }}>
              JELAJAHI MLAKOOW
            </span>
            <h2 className="section-title">Semua yang Kamu Butuhkan</h2>
            <p style={{ color: '#4A5568', marginTop: '0.75rem', fontSize: '1.05rem', maxWidth: '600px', margin: '0.75rem auto 0' }}>
              Nikmati kemudahan merencanakan liburan, mencari tempat nongkrong, hingga booking tiket dalam satu genggaman.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map(feat => (
              <Link href={feat.link} key={feat.title} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '24px', border: '1px solid #E5E9F0', transition: 'all 0.3s' }} className="feature-card">
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${feat.color}15`, color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <feat.icon size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.75rem' }}>{feat.title}</h3>
                  <p style={{ color: '#4A5568', lineHeight: 1.6, fontSize: '0.95rem' }}>{feat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== KATEGORI ===================== */}
      <section style={{ padding: '5rem 0', background: '#F8F6F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title">Temukan Sesuai Minat</h2>
            </div>
            <Link href="/wisata" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0A4A5E', textDecoration: 'none' }}>
              Lihat Semua Kategori <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => {
              const colors = categoryColors[cat.slug] || { bg: '#FFFFFF', text: '#4A5568', border: '#E5E9F0' }
              return (
                <Link
                  key={cat.id}
                  href={['wisata', 'kuliner', 'cafe', 'hiburan', 'oleh-oleh'].includes(cat.slug) ? `/${cat.slug}` : `/wisata?category=${cat.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="category-card"
                    style={{
                      background: 'white',
                      border: `1px solid #E5E9F0`,
                      borderRadius: '24px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ width: '70px', height: '70px', background: colors.bg, color: colors.text, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.25rem' }}>
                      {cat.icon}
                    </div>
                    <div style={{ fontWeight: 800, color: '#1A2332', fontSize: '1.05rem' }}>{cat.name}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===================== WISATA TERDEKAT ===================== */}
      <NearbyRecommendations destinations={allDestinations} />

      {/* ===================== DESTINASI POPULER ===================== */}
      <section style={{ padding: '6rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                ⭐ PALING POPULER
              </span>
              <h2 className="section-title">Destinasi Favorit Wisatawan</h2>
              <p style={{ color: '#4A5568', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Tempat-tempat terbaik yang wajib dikunjungi di Surabaya
              </p>
            </div>
            <Link href="/wisata?tag=featured" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#0A4A5E', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          {featuredDestinations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {featuredDestinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  {...dest}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#F8F6F2', borderRadius: '20px', color: '#8B98A9' }}>
              <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Data destinasi belum tersedia. Jalankan seed data terlebih dahulu.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===================== EVENT TERBARU ===================== */}
      {upcomingEvents.length > 0 && (
        <section style={{ padding: '6rem 0', background: '#F8FAFC' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ display: 'inline-block', background: '#E0F2FE', color: '#0A4A5E', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                  🗓️ EVENT SURABAYA
                </span>
                <h2 className="section-title">Sedang & Akan Berlangsung</h2>
              </div>
              <Link href="/extras/kalender-event" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#0A4A5E', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
                Lihat Kalender <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {upcomingEvents.map(event => {
                const now = new Date()
                const isOngoing = now >= new Date(event.startDate) && now <= new Date(event.endDate)
                return (
                  <Link href={`/extras/kalender-event/${event.slug}`} key={event.id} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #E5E9F0', transition: 'transform 0.3s' }} className="event-home-card">
                      <div style={{ height: '200px', position: 'relative' }}>
                        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: isOngoing ? '#10B981' : '#F59E0B', color: 'white', padding: '6px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {isOngoing ? 'Sedang Berlangsung' : 'Akan Datang'}
                        </div>
                      </div>
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF6B35', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                          <Calendar size={14} />
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem', lineHeight: 1.3 }}>{event.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B98A9', fontSize: '0.85rem' }}>
                          <MapPin size={14} /> {event.location}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== SMART ITINERARY CTA ===================== */}
      <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, #0A4A5E 0%, #0D6E84 50%, #062E3A 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', color: '#FF8C5E', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                <Zap size={13} /> FITUR UNGGULAN
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
                Smart Itinerary — <span style={{ color: '#FF6B35' }}>Rencana Trip</span> Otomatis
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '580px', marginBottom: '2rem' }}>
                Masukkan preferensi perjalanan kamu dan biarkan MLAKOOW menyusun itinerary efisien yang mengoptimalkan rute, waktu, dan biaya kamu di Surabaya.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {['📍 Grouping area', '⏰ Slot waktu', '💰 Estimasi budget', '🚌 Info transport'].map(feat => (
                  <div key={feat} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 14px', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {feat}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <Link href="/itinerary" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', background: '#FF6B35' }}>
                <Zap size={20} /> Buat Itinerary <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== AREA SURABAYA ===================== */}
      <section style={{ padding: '6rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title">Jelajahi Wilayah Surabaya</h2>
            <p style={{ color: '#4A5568', marginTop: '0.5rem', fontSize: '1rem' }}>
              Setiap area punya karakteristik wisata yang unik
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {areas.map((area) => (
              <Link key={area.name} href={`/wisata?area=${encodeURIComponent(area.name)}`} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '240px', cursor: 'pointer' }}>
                  <img src={area.bg} alt={area.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${area.color}FA 0%, ${area.color}88 50%, transparent 100%)` }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', color: 'white' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{area.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{area.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.4 }}>{area.desc}</div>
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

      {/* Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @media (max-width: 992px) {
          .hero-images { display: none !important; }
        }
        .hover-bg-white-20:hover { background: rgba(255,255,255,0.2) !important; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.05); border-color: #CBD5E1 !important; }
        .category-card:hover { transform: translateY(-5px); border-color: #0A4A5E !important; box-shadow: 0 15px 40px rgba(10,74,94,0.1) !important; }
        .event-home-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important; }
      `}</style>
    </div>
  )
}
