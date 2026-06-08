import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Phone, ShieldAlert, Ambulance, Info, MapPin, ChevronDown } from 'lucide-react'

export const metadata = {
  title: 'Bantuan & FAQ - MLAKOOW',
  description: 'Pusat Bantuan, Kontak Darurat, dan Pertanyaan Umum MLAKOOW Surabaya',
}

export default function BantuanPage() {
  const faqs = [
    {
      q: 'Bagaimana cara menggunakan Smart Itinerary?',
      a: 'Anda cukup memilih beberapa destinasi favorit dan mengeklik tombol "Generate Itinerary". Sistem AI kami akan otomatis menyusun rute terbaik berdasarkan jarak dan waktu operasional setiap tempat wisata.'
    },
    {
      q: 'Apakah pemesanan tiket melalui MLAKOOW terjamin?',
      a: 'Ya, seluruh pemesanan tiket kami terintegrasi langsung dengan loket resmi destinasi wisata Surabaya. Anda akan mendapatkan e-ticket yang bisa di-scan langsung di pintu masuk.'
    },
    {
      q: 'Bagaimana jika saya ingin membatalkan pesanan?',
      a: 'Pembatalan pesanan dapat dilakukan maksimal H-1 sebelum tanggal kunjungan melalui menu Profil -> Histori Transaksi. Saldo akan dikembalikan dalam waktu 2x24 jam.'
    },
    {
      q: 'Apakah aplikasi ini menyediakan rute jalan kaki?',
      a: 'Saat ini MLAKOOW mengoptimalkan rute untuk kendaraan bermotor roda dua dan empat menggunakan Google Maps. Anda bisa beralih ke mode jalan kaki di aplikasi Google Maps setelah mengeklik "Rute GMaps".'
    }
  ]

  const emergencies = [
    { name: 'Polisi (Keamanan & Kecelakaan)', number: '110', icon: ShieldAlert, color: '#3B82F6' },
    { name: 'Ambulans / Gawat Darurat Medis', number: '118', icon: Ambulance, color: '#EF4444' },
    { name: 'Pemadam Kebakaran', number: '113', icon: ShieldAlert, color: '#F59E0B' },
    { name: 'Call Center Pariwisata Surabaya', number: '031-112', icon: Info, color: '#10B981' },
    { name: 'Pusat Informasi Turis (TIC) Balai Pemuda', number: '031-5312154', icon: MapPin, color: '#8B5CF6' },
  ]

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '4rem' }}>
        {/* Header Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0A4A5E 0%, #1A2332 100%)', padding: '5rem 1.5rem', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Bantuan & Informasi Darurat</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Kami siap membantu Anda kapan saja. Berikut adalah pusat informasi darurat dan jawaban atas pertanyaan yang sering diajukan.
          </p>
        </div>

        <div style={{ maxWidth: '1000px', margin: '-3rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Kolom Darurat */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(10,74,94,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '12px' }}>
                  <Phone size={24} color="#EF4444" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A2332' }}>Kontak Darurat</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {emergencies.map((em, idx) => {
                  const Icon = em.icon
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E5E9F0', borderRadius: '16px', transition: 'all 0.2s', background: '#FAFCFE' }} className="emergency-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: `${em.color}15`, padding: '10px', borderRadius: '10px' }}>
                          <Icon size={20} color={em.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 600, marginBottom: '2px' }}>{em.name}</div>
                          <div style={{ fontSize: '1.25rem', color: '#1A2332', fontWeight: 900 }}>{em.number}</div>
                        </div>
                      </div>
                      <a href={`tel:${em.number}`} style={{ background: em.color, color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, transition: 'transform 0.2s' }} className="btn-call">
                        Panggil
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Kolom FAQ */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(10,74,94,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ background: '#E0F2FE', padding: '12px', borderRadius: '12px' }}>
                  <Info size={24} color="#0A4A5E" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A2332' }}>FAQ (Tanya Jawab)</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, idx) => (
                  <details key={idx} className="faq-item" style={{ background: '#FAFCFE', border: '1px solid #E5E9F0', borderRadius: '16px', overflow: 'hidden' }}>
                    <summary style={{ padding: '1.25rem', fontWeight: 700, color: '#1A2332', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {faq.q}
                      <ChevronDown size={18} color="#8B98A9" className="chevron" />
                    </summary>
                    <div style={{ padding: '0 1.25rem 1.25rem', color: '#4A5568', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px dashed #E5E9F0', paddingTop: '1rem', marginTop: '-0.5rem' }}>
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
              
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#FFFBEB', borderRadius: '16px', border: '1px solid #FEF3C7', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Info size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#B45309', marginBottom: '4px' }}>Butuh Bantuan Lain?</div>
                  <div style={{ color: '#92400E', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Anda dapat mengirimkan email ke <strong>support@mlakoow.id</strong> atau mengirim pesan WhatsApp ke <strong>+62 812-3456-7890</strong> untuk bantuan teknis aplikasi.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        .emergency-card:hover { border-color: #CBD5E1 !important; transform: translateY(-2px); }
        .btn-call:hover { transform: scale(1.05); }
        
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item[open] .chevron { transform: rotate(180deg); }
        .chevron { transition: transform 0.3s; }
      `}</style>
    </>
  )
}
