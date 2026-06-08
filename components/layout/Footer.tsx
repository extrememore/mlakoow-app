'use client'

import Link from 'next/link'
import { MapPin, Globe, MessageCircle, Share2, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)',
        color: 'white',
        padding: '4rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ 
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2px',
                  border: '1px solid rgba(255,255,255,0.3)',
                }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>MLAKOOW</div>
                <div style={{ fontSize: '0.65rem', color: '#FF8C5E', fontWeight: 600, letterSpacing: '0.5px' }}>
                  SMART TOURISM SURABAYA
                </div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '280px' }}>
              Asisten perjalanan wisata hyperlocal untuk Kota Surabaya. Dari eksplorasi hingga itinerary — semuanya di satu platform.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,53,0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                  <Icon size={18} color="white" />
                </a>
              ))}
            </div>
          </div>

          {/* Jelajahi */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'white', fontSize: '1rem' }}>
              Jelajahi
            </h3>
            {[
              { href: '/destinasi', label: 'Semua Destinasi' },
              { href: '/destinasi?category=alam', label: 'Wisata Alam' },
              { href: '/destinasi?category=sejarah', label: 'Wisata Sejarah' },
              { href: '/destinasi?category=kuliner', label: 'Kuliner' },
              { href: '/destinasi?hiddenGem=true', label: 'Hidden Gems' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  marginBottom: '0.65rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C5E')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Fitur */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'white', fontSize: '1rem' }}>
              Fitur
            </h3>
            {[
              { href: '/itinerary', label: 'Smart Itinerary' },
              { href: '/destinasi', label: 'Cari Destinasi' },
              { href: '/profil', label: 'Profil & Riwayat' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  marginBottom: '0.65rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C5E')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Area Surabaya */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'white', fontSize: '1rem' }}>
              Area Surabaya
            </h3>
            {[
              'Surabaya Pusat',
              'Surabaya Utara',
              'Surabaya Selatan',
              'Surabaya Timur',
              'Surabaya Barat',
            ].map((area) => (
              <Link
                key={area}
                href={`/destinasi?area=${encodeURIComponent(area)}`}
                style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  marginBottom: '0.65rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C5E')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              >
                {area}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            © 2024 MLAKOOW. Dibuat dengan{' '}
            <Heart size={12} style={{ display: 'inline', color: '#FF6B35' }} /> untuk Surabaya.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            Proyek Kuliah — Smart Tourism Web App
          </p>
        </div>
      </div>
    </footer>
  )
}
