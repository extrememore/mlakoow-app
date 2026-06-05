'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import {
  Calendar,
  Ticket,
  CreditCard,
  Landmark,
  Wallet,
  ChevronRight,
  Shield,
  CheckCircle,
  Loader,
  ArrowLeft,
  Users,
} from 'lucide-react'

const PAYMENT_METHODS = [
  {
    id: 'transfer_bca',
    name: 'Transfer BCA',
    icon: '🏦',
    description: 'Transfer antar bank BCA',
    group: 'Transfer Bank',
  },
  {
    id: 'transfer_mandiri',
    name: 'Transfer Mandiri',
    icon: '🏦',
    description: 'Transfer antar bank Mandiri',
    group: 'Transfer Bank',
  },
  {
    id: 'transfer_bri',
    name: 'Transfer BRI',
    icon: '🏦',
    description: 'Transfer antar bank BRI',
    group: 'Transfer Bank',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: '💚',
    description: 'Bayar lewat aplikasi Gojek',
    group: 'Dompet Digital',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: '💜',
    description: 'Bayar lewat aplikasi OVO',
    group: 'Dompet Digital',
  },
  {
    id: 'qris',
    name: 'QRIS',
    icon: '📱',
    description: 'Scan QR dari aplikasi apapun',
    group: 'Dompet Digital',
  },
  {
    id: 'visa',
    name: 'Kartu Kredit/Debit Visa',
    icon: '💳',
    description: 'Semua kartu berlogo Visa/Mastercard',
    group: 'Kartu',
  },
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()

  const destinationId = parseInt(searchParams.get('destinationId') || '0')
  const destinationName = searchParams.get('name') || 'Destinasi'
  const ticketPrice = parseInt(searchParams.get('price') || '0')

  const [visitDate, setVisitDate] = useState('')
  const [ticketCount, setTicketCount] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('')
  const [step, setStep] = useState(1) // 1: form, 2: payment, 3: processing
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const subtotal = ticketPrice * ticketCount
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.02) : 0
  const total = subtotal + serviceFee

  const groups = [...new Set(PAYMENT_METHODS.map(m => m.group))]

  // Guard: free destinations should not go through checkout
  if (ticketPrice === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎟️</div>
            <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1A2332', marginBottom: '0.75rem' }}>
              Destinasi Ini Gratis!
            </h1>
            <p style={{ color: '#4A5568', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              <strong>{destinationName}</strong> tidak memerlukan tiket berbayar.
              Anda bisa langsung mengunjungi destinasi ini tanpa perlu melakukan pemesanan.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href={`/destinasi`}
                className="btn-primary"
                style={{ justifyContent: 'center', display: 'flex' }}
              >
                <CheckCircle size={18} />
                Lihat Destinasi Lainnya
              </Link>
              <Link
                href="/"
                style={{ color: '#8B98A9', fontSize: '0.875rem', textDecoration: 'none' }}
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  async function handleConfirmPayment() {
    if (!selectedPayment) {
      setError('Pilih metode pembayaran terlebih dahulu')
      return
    }
    setError('')
    setStep(3)
    setLoading(true)

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2500))

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId, visitDate, ticketCount }),
      })

      if (res.ok) {
        const booking = await res.json()
        router.push(`/booking/sukses?code=${booking.bookingCode}&name=${encodeURIComponent(destinationName)}&date=${visitDate}&count=${ticketCount}&total=${total}&payment=${selectedPayment}`)
      } else {
        setError('Gagal memproses pembayaran. Silakan coba lagi.')
        setStep(2)
        setLoading(false)
      }
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.')
      setStep(2)
      setLoading(false)
    }
  }

  // Step 3: Processing screen
  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #062E3A, #0A4A5E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Memproses Pembayaran...</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Sedang menghubungi server pembayaran.<br />Mohon jangan tutup halaman ini.
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)', padding: '2rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Link href={`/destinasi`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <ArrowLeft size={15} /> Kembali
          </Link>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, marginBottom: '0.5rem' }}>
            {step === 1 ? '🎟️ Detail Pemesanan' : '💳 Pembayaran'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{destinationName}</p>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0', marginTop: '1.25rem', maxWidth: '320px' }}>
            {['Detail', 'Bayar', 'Selesai'].map((label, i) => {
              const stepNum = i + 1
              const active = step >= stepNum
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: active ? '#FF6B35' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'white' }}>
                      {stepNum}
                    </div>
                    <span style={{ fontSize: '0.65rem', marginTop: '4px', color: active ? '#FF6B35' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: '2px', background: step > stepNum ? '#FF6B35' : 'rgba(255,255,255,0.2)', margin: '0 6px', marginBottom: '14px' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {step === 1 && (
              <>
                {/* Ticket info */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ticket size={18} color="#FF6B35" /> Informasi Tiket
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Visit date */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#4A5568', marginBottom: '8px' }}>
                        Tanggal Kunjungan *
                      </label>
                      <input
                        type="date"
                        min={today}
                        max={maxDate}
                        value={visitDate}
                        onChange={e => setVisitDate(e.target.value)}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                    {/* Ticket count */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#4A5568', marginBottom: '8px' }}>
                        Jumlah Tiket *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E5E9F0', background: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4A5568', fontFamily: 'Outfit, sans-serif' }}
                        >−</button>
                        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1.3rem', color: '#1A2332' }}>
                          {ticketCount}
                          <div style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 500 }}>orang</div>
                        </div>
                        <button
                          onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #0A4A5E', background: '#0A4A5E', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}
                        >+</button>
                      </div>
                    </div>

                    {/* Info pengunjung */}
                    <div style={{ background: '#F0F7FA', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Users size={15} color="#0A4A5E" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <p style={{ fontSize: '0.8rem', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>
                        Tiket ini berlaku untuk <strong>{ticketCount} orang</strong>.
                        {ticketPrice === 0 ? ' Masuk gratis, tidak ada biaya tambahan.' : ' Pastikan membawa bukti pemesanan (kode booking) saat tiba di lokasi.'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!visitDate) { setError('Pilih tanggal kunjungan terlebih dahulu'); return }
                    setError('')
                    setStep(ticketPrice === 0 ? 3 : 2)
                    if (ticketPrice === 0) handleConfirmPayment()
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                >
                  {ticketPrice === 0 ? 'Konfirmasi Kunjungan' : 'Lanjut ke Pembayaran'}
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Payment methods */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#FF6B35" /> Pilih Metode Pembayaran
                  </h2>

                  {groups.map(group => (
                    <div key={group} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{group}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {PAYMENT_METHODS.filter(m => m.group === group).map(method => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '0.875rem 1rem', borderRadius: '14px', cursor: 'pointer',
                              border: `2px solid ${selectedPayment === method.id ? '#0A4A5E' : '#E5E9F0'}`,
                              background: selectedPayment === method.id ? '#F0F7FA' : 'white',
                              textAlign: 'left', width: '100%', fontFamily: 'Outfit, sans-serif',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{method.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>{method.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>{method.description}</div>
                            </div>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedPayment === method.id ? '#0A4A5E' : '#CBD5E0'}`, background: selectedPayment === method.id ? '#0A4A5E' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {selectedPayment === method.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '0.875rem 1rem', color: '#B91C1C', fontSize: '0.875rem', fontWeight: 500 }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Security badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B98A9', fontSize: '0.78rem', padding: '0 0.5rem' }}>
                  <Shield size={14} color="#10B981" />
                  <span>Transaksi Anda dilindungi enkripsi SSL 256-bit</span>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                >
                  Bayar Rp {total.toLocaleString('id-ID')}
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#8B98A9', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', textDecoration: 'underline' }}
                >
                  ← Kembali ubah detail
                </button>
              </>
            )}
          </div>

          {/* Order summary sidebar */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '1.25rem' }}>📋 Ringkasan Pesanan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>{destinationName}</div>
                  {visitDate && <div style={{ fontSize: '0.78rem', color: '#8B98A9', marginTop: '3px' }}>📅 {new Date(visitDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div>}
                </div>
                <div style={{ height: '1px', background: '#E5E9F0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#4A5568' }}>{ticketCount}x Tiket</span>
                  <span style={{ fontWeight: 600 }}>{ticketPrice === 0 ? 'Gratis' : `Rp ${subtotal.toLocaleString('id-ID')}`}</span>
                </div>
                {serviceFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#4A5568' }}>Biaya layanan</span>
                    <span style={{ fontWeight: 600 }}>Rp {serviceFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div style={{ height: '1px', background: '#E5E9F0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#1A2332' }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0A4A5E' }}>
                    {total === 0 ? 'Gratis' : `Rp ${total.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>

              {selectedPayment && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F0F7FA', borderRadius: '12px', fontSize: '0.8rem', color: '#4A5568' }}>
                  💳 {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {error && step === 1 && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 24px rgba(239,68,68,0.3)', zIndex: 50, whiteSpace: 'nowrap' }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: '#0A4A5E' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
