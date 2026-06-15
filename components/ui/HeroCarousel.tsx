'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Star, MapPin, ChevronLeft, ChevronRight, Users } from 'lucide-react'

export default function HeroCarousel({ destinations }: { destinations: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  if (!destinations || destinations.length === 0) return null

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const getUrl = (dest: any) => {
    const slug = dest.category?.slug || ''
    if (['wisata', 'kuliner', 'cafe', 'hiburan', 'oleh-oleh'].includes(slug)) {
      return `/${slug}/${dest.slug}`
    }
    return `/wisata/${dest.slug}`
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', marginLeft: 'auto' }}>
      {/* Floating Stats - moved above carousel to still be visible */}
      <div style={{ position: 'absolute', top: '-20px', right: '0px', background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '15px', animation: 'float 6s ease-in-out infinite' }}>
        <div style={{ background: '#E0F2FE', padding: '10px', borderRadius: '15px', color: '#0A4A5E' }}><Users size={20} /></div>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1A2332' }}>5,000+</div>
          <div style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 600 }}>Wisatawan Aktif</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', marginBottom: '15px', marginTop: '20px' }}>
        <button onClick={scrollLeft} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', color: 'white', transition: 'all 0.3s' }} className="hero-nav-btn">
          <ChevronLeft size={22} />
        </button>
        <button onClick={scrollRight} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', color: 'white', transition: 'all 0.3s' }} className="hero-nav-btn">
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Carousel Track */}
      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          gap: '24px', 
          overflowX: 'auto', 
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '30px', // shadow space
          scrollBehavior: 'smooth'
        }}
        className="hide-scrollbar"
      >
        {destinations.map((dest) => (
          <div 
            key={dest.id} 
            style={{ 
              minWidth: '280px', 
              maxWidth: '280px',
              scrollSnapAlign: 'start',
              position: 'relative',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              border: '6px solid rgba(255,255,255,0.15)',
              aspectRatio: '3/4',
              flexShrink: 0,
              transform: 'translateZ(0)' // Hardware acceleration
            }}
          >
            <img 
              src={dest.mainImage} 
              alt={dest.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            
            {/* Gradient Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,46,58,0.95) 0%, rgba(10,74,94,0) 60%)' }} />
            
            {/* Content */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', color: 'white' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FF6B35', padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px' }}>
                <Star size={12} fill="white" /> {dest.rating?.toFixed(1) || "4.8"}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '6px', lineHeight: 1.2 }}>{dest.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                <MapPin size={14} /> {dest.area}
              </div>
            </div>
            
            {/* Link overlay */}
            <Link href={getUrl(dest)} style={{ position: 'absolute', inset: 0 }} />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hero-nav-btn:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: scale(1.05);
        }
      `}} />
    </div>
  )
}
