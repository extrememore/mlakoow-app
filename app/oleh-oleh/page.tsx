import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { ShoppingBag } from 'lucide-react'

export const metadata = {
  title: 'Pusat Oleh-oleh Surabaya - MLAKOOW',
  description: 'Berbelanja oleh-oleh khas Surabaya mulai dari makanan ringan, kaos, hingga kerajinan tangan.',
}

export default function OlehOlehPage() {
  
  const customBanner = (
    <div
      style={{
        marginTop: '3rem',
        background: 'linear-gradient(135deg, #FFF5F0 0%, #FFF1E6 100%)',
        border: '1px solid #FDDCBE',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛍️</div>
      <div>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#7B1A00', marginBottom: '0.5rem' }}>
          Tips Belanja Oleh-oleh Khas Surabaya
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
          {[
            '🦈 Kerupuk Sirip Hiu',
            '🤎 Petis Udang Asli',
            '🍬 Carang Mas',
            '🍪 Kue Sagon',
            '🫙 Sambal Cumi',
            '🍞 Roti Pao Ampel',
          ].map((item) => (
            <span
              key={item}
              style={{
                background: 'rgba(192,57,43,0.08)',
                border: '1px solid rgba(192,57,43,0.2)',
                color: '#7B1A00',
                padding: '5px 12px',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <DestinationExplorer
      title="Pusat Oleh-oleh"
      subtitle="BELANJA & BUAH TANGAN"
      description="Temukan {total} pusat perbelanjaan dan toko oleh-oleh khas Surabaya terbaik untuk dibawa pulang."
      fixedCategory="oleh-oleh"
      gradient="linear-gradient(135deg, #047857 0%, #10B981 100%)"
      icon={<ShoppingBag size={18} color="white" />}
      customBanner={customBanner}
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
    />
  )
}
