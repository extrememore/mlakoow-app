'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ItineraryPickerModal from '@/components/ui/ItineraryPickerModal'
import { Heart, MapPin, Star, Wallet, Loader, ExternalLink, CalendarPlus } from 'lucide-react'

export default function SharedWishlistPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/wishlist/shared/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => { setError('Gagal memuat wishlist'); setLoading(false) })
  }, [token])

  function getHref(d: any) {
    const cat = d.category.slug
    if (cat === 'kuliner') return `/kuliner/${d.slug}`
    if (cat === 'cafe') return `/cafe/${d.slug}`
    if (cat === 'oleh-oleh') return `/oleh-oleh/${d.slug}`
    if (cat === 'hiburan' || cat === 'spot-foto') return `/hiburan/${d.slug}`
    return `/wisata/${d.slug}`
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A855F7 100%)', padding: '3rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} fill="white" color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>WISHLIST DIBAGIKAN</div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0 }}>
                {data ? `Wishlist milik ${data.owner.name}` : 'Memuat Wishlist...'}
              </h1>
            </div>
          </div>
          {data && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              {data.items.length} destinasi pilihan · Kamu bisa simpan ke wishlist atau itinerary kamu sendiri!
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#8B98A9' }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Memuat wishlist...</p>
          </div>
        ) : error ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #E5E9F0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.75rem' }}>{error}</h2>
            <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Kembali ke Beranda</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {data.items.map((item: any) => {
              const d = item.destination
              const href = getHref(d)
              return (
                <div key={item.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', paddingTop: '55%', overflow: 'hidden' }}>
                    <img src={d.mainImage} alt={d.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/placeholder.png' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <span className="badge" style={{ background: d.category.color + '22', color: d.category.color, border: `1px solid ${d.category.color}44` }}>
                        {d.category.icon} {d.category.name}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>{d.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#8B98A9' }}>
                      <MapPin size={13} color="#C0392B" /> {d.area}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #F0F4F8', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} fill="#F59E0B" color="#F59E0B" />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.rating > 0 ? d.rating.toFixed(1) : 'Baru'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wallet size={12} color="#0A4A5E" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A4A5E' }}>
                          {d.ticketPrice === 0 ? 'Gratis' : `Rp ${d.ticketPrice.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                      <Link href={href} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.65rem', borderRadius: '10px', background: '#F0F7FA', color: '#0A4A5E', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem', border: '1.5px solid #BAE6FD' }}>
                        <ExternalLink size={13} /> Detail
                      </Link>
                      <ItineraryPickerModal
                        destinationId={d.id}
                        destinationName={d.name}
                        destinationSlug={d.slug}
                        trigger={
                          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.65rem', borderRadius: '10px', background: '#EFF6FF', color: '#1E40AF', fontWeight: 600, fontSize: '0.8rem', border: '1.5px solid #BFDBFE', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                            <CalendarPlus size={13} /> Itinerary
                          </button>
                        }
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
