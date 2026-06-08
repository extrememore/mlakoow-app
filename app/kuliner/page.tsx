import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Kuliner Legendaris Surabaya - MLAKOOW',
  description: 'Temukan destinasi kuliner legendaris Surabaya — dari Rawon, Rujak Cingur, Pecel Semanggi, dan makanan khas lainnya.',
}

const CravingBanner = () => {
  const cravings = [
    { name: 'Rawon', icon: '🍲', color: '#7B1A00' },
    { name: 'Rujak Cingur', icon: '🥗', color: '#27AE60' },
    { name: 'Lontong Balap', icon: '🥘', color: '#D35400' },
    { name: 'Bebek', icon: '🦆', color: '#C0392B' },
    { name: 'Sate', icon: '🍢', color: '#E67E22' },
  ]
  return (
    <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(123,26,0,0.05) 0%, rgba(230,126,34,0.05) 100%)', borderRadius: '24px', border: '1px solid rgba(230,126,34,0.2)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem', textAlign: 'center' }}>Ngidam Apa Hari Ini? 🤤</h3>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', justifyContent: 'center' }}>
        {cravings.map(c => (
          <Link key={c.name} href={`/kuliner?search=${encodeURIComponent(c.name)}`} style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem 1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #E5E9F0', minWidth: '110px' }}>
              <div style={{ fontSize: '2.5rem' }}>{c.icon}</div>
              <span style={{ fontWeight: 700, color: c.color, fontSize: '0.9rem' }}>{c.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function KulinerPage() {
  return (
    <DestinationExplorer
      title="Kuliner Legendaris"
      subtitle="KULINER KHAS SURABAYA"
      description="Temukan {total} destinasi kuliner legendaris Surabaya — dari Rawon, Rujak Cingur, Pecel Semanggi, hingga hidangan otentik lainnya."
      fixedCategory="kuliner"
      pageType="kuliner"
      gradient="linear-gradient(135deg, #7B1A00 0%, #C0392B 50%, #E67E22 100%)"
      icon={<UtensilsCrossed size={18} color="white" />}
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
      customBanner={<CravingBanner />}
    />
  )
}
