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
  ChevronRight,
  Shield,
  CheckCircle,
  Loader,
  ArrowLeft,
  Users,
  Copy,
  CheckCheck,
  Zap,
  Lock,
} from 'lucide-react'

const PAYMENT_METHODS = [
  { id: 'transfer_bca', name: 'Transfer BCA', icon: '🔵', description: 'Transfer antar bank BCA', group: 'Transfer Bank' },
  { id: 'transfer_mandiri', name: 'Transfer Mandiri', icon: '🟡', description: 'Transfer antar bank Mandiri', group: 'Transfer Bank' },
  { id: 'transfer_bri', name: 'Transfer BRI', icon: '🔵', description: 'Transfer antar bank BRI', group: 'Transfer Bank' },
  { id: 'gopay', name: 'GoPay', icon: '💚', description: 'Bayar lewat aplikasi Gojek', group: 'Dompet Digital' },
  { id: 'ovo', name: 'OVO', icon: '💜', description: 'Bayar lewat aplikasi OVO', group: 'Dompet Digital' },
  { id: 'dana', name: 'DANA', icon: '🔷', description: 'Bayar lewat aplikasi DANA', group: 'Dompet Digital' },
  { id: 'qris', name: 'QRIS', icon: '📱', description: 'Scan QR dari aplikasi apapun', group: 'Dompet Digital' },
  { id: 'visa', name: 'Kartu Kredit/Debit Visa', icon: '💳', description: 'Semua kartu berlogo Visa/Mastercard', group: 'Kartu Kredit' },
]

// Payment instruction data
const PAYMENT_INSTRUCTIONS: Record<string, any> = {
  transfer_bca: {
    title: 'Transfer BCA',
    color: '#006BAD',
    bg: '#E8F4FE',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '1234567890',
    accountName: 'PT MLAKOOW WISATA INDONESIA',
    steps: [
      'Buka aplikasi BCA Mobile atau m-BCA',
      'Pilih menu "Transfer" → "Antar Rekening BCA"',
      'Masukkan nomor rekening di atas',
      'Masukkan jumlah transfer sesuai TOTAL BAYAR (jangan salah nominal!)',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  transfer_mandiri: {
    title: 'Transfer Mandiri',
    color: '#003F88',
    bg: '#E8F0FF',
    bankName: 'Bank Mandiri',
    accountNumber: '1370099887766',
    accountName: 'PT MLAKOOW WISATA INDONESIA',
    steps: [
      'Buka aplikasi Livin\' by Mandiri',
      'Pilih "Transfer" → "Ke Rekening Bank Lain / Mandiri"',
      'Masukkan nomor rekening di atas',
      'Masukkan nominal sesuai TOTAL BAYAR',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  transfer_bri: {
    title: 'Transfer BRI',
    color: '#00529B',
    bg: '#E8F1FF',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    accountNumber: '0085-01-234567-50-9',
    accountName: 'PT MLAKOOW WISATA INDONESIA',
    steps: [
      'Buka aplikasi BRImo',
      'Pilih "Transfer" → "Ke Sesama BRI / Bank Lain"',
      'Masukkan nomor rekening di atas',
      'Masukkan nominal sesuai TOTAL BAYAR',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  gopay: {
    title: 'GoPay',
    color: '#00AED6',
    bg: '#E0F8FF',
    phoneNumber: '0812-3456-7890',
    appName: 'Gojek / GoPay',
    steps: [
      'Buka aplikasi Gojek',
      'Pilih menu "GoPay"',
      'Pilih "Kirim" atau "Transfer"',
      'Masukkan nomor HP di atas',
      'Masukkan nominal sesuai TOTAL BAYAR',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  ovo: {
    title: 'OVO',
    color: '#4C3494',
    bg: '#F0ECFF',
    phoneNumber: '0813-9988-7766',
    appName: 'OVO',
    steps: [
      'Buka aplikasi OVO',
      'Pilih menu "Transfer"',
      'Masukkan nomor HP yang terdaftar di OVO di atas',
      'Masukkan nominal sesuai TOTAL BAYAR',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  dana: {
    title: 'DANA',
    color: '#118EEA',
    bg: '#E6F4FF',
    phoneNumber: '0811-2200-3344',
    appName: 'DANA',
    steps: [
      'Buka aplikasi DANA',
      'Pilih "Transfer ke Sesama DANA"',
      'Masukkan nomor HP di atas',
      'Masukkan nominal sesuai TOTAL BAYAR',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  qris: {
    title: 'QRIS',
    color: '#E63946',
    bg: '#FEE8E8',
    steps: [
      'Buka aplikasi GoPay, OVO, DANA, BCA Mobile, atau aplikasi lainnya',
      'Pilih menu "Scan" atau "Bayar dengan QRIS"',
      'Arahkan kamera ke QR Code yang ditampilkan di atas',
      'Verifikasi nominal pembayaran sesuai TOTAL BAYAR',
      'Konfirmasi dan selesaikan pembayaran',
    ],
  },
  visa: {
    title: 'Kartu Kredit/Debit',
    color: '#1A2332',
    bg: '#F1F5F9',
    steps: [
      'Masukkan nomor kartu (16 digit di depan kartu)',
      'Masukkan nama pemegang kartu',
      'Masukkan tanggal kadaluarsa dan CVV (3 digit belakang kartu)',
      'Klik "Bayar" untuk menyelesaikan transaksi',
    ],
  },
}

// Fake QRIS generator component
function FakeQRIS({ total, code }: { total: number; code: string }) {
  const seed = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      {/* QRIS logo strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#E63946', borderRadius: '8px', padding: '4px 12px' }}>
        <span style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '1px' }}>QRIS</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>Pembayaran Nasional</span>
      </div>
      {/* QR Code */}
      <div style={{
        width: '180px', height: '180px', background: 'white', border: '3px solid #1A2332',
        borderRadius: '12px', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(15,1fr)', gap: '1px'
      }}>
        {Array.from({ length: 225 }).map((_, i) => {
          // Corners (finder patterns)
          const row = Math.floor(i / 15)
          const col = i % 15
          const isCorner =
            (row < 6 && col < 6) || (row < 6 && col > 8) || (row > 8 && col < 6)
          const isInnerCorner =
            (row >= 1 && row <= 4 && col >= 1 && col <= 4) ||
            (row >= 1 && row <= 4 && col >= 10 && col <= 13) ||
            (row >= 10 && row <= 13 && col >= 1 && col <= 4)
          const isCore =
            (row >= 2 && row <= 3 && col >= 2 && col <= 3) ||
            (row >= 2 && row <= 3 && col >= 11 && col <= 12) ||
            (row >= 11 && row <= 12 && col >= 2 && col <= 3)
          const dataVal = ((seed * (i + 1) * 7 + i * 13) % 3) === 0
          let dark = false
          if (isCorner) dark = true
          if (isInnerCorner) dark = false
          if (isCore) dark = true
          if (!isCorner && !isInnerCorner && !isCore) dark = dataVal
          return <div key={i} style={{ background: dark ? '#1A2332' : 'white', borderRadius: dark ? '1px' : 0 }} />
        })}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#4A5568', textAlign: 'center' }}>
        Rp {total.toLocaleString('id-ID')}
        <div style={{ fontSize: '0.7rem', color: '#8B98A9', marginTop: '2px' }}>Berlaku 10 menit</div>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #CBD5E0', borderRadius: '6px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', color: '#4A5568', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s' }}
    >
      {copied ? <><CheckCheck size={12} color="#10B981" /> Tersalin!</> : <><Copy size={12} /> Salin</>}
    </button>
  )
}

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
  const [step, setStep] = useState(1) // 1: detail, 2: pilih bayar, 3: instruksi & konfirmasi
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [error, setError] = useState('')
  const [bookingCode, setBookingCode] = useState('')

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const subtotal = ticketPrice * ticketCount
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.02) : 0
  const total = subtotal + serviceFee

  const groups = [...new Set(PAYMENT_METHODS.map(m => m.group))]
  const paymentInfo = PAYMENT_INSTRUCTIONS[selectedPayment]

  // Generate a fake booking code for preview
  const previewCode = bookingCode || ('MLK-' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').sort(() => Math.random() - 0.5).slice(0, 8).join(''))

  // Guard: free destinations
  if (ticketPrice === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎟️</div>
            <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1A2332', marginBottom: '0.75rem' }}>Destinasi Ini Gratis!</h1>
            <p style={{ color: '#4A5568', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              <strong>{destinationName}</strong> tidak memerlukan tiket berbayar.
            </p>
            <Link href="/destinasi" className="btn-primary" style={{ justifyContent: 'center', display: 'flex' }}>
              <CheckCircle size={18} /> Lihat Destinasi Lainnya
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Step 2→3: Create booking record (pending) then show instructions
  async function handleGoToInstructions() {
    if (!selectedPayment) { setError('Pilih metode pembayaran terlebih dahulu'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId, visitDate, ticketCount }),
      })
      if (res.ok) {
        const data = await res.json()
        setBookingCode(data.bookingCode)
        setStep(3)
      } else {
        const errData = await res.json()
        setError(errData.error || 'Gagal membuat pemesanan.')
      }
    } catch {
      setError('Terjadi kesalahan koneksi.')
    }
    setLoading(false)
  }

  // Step 3: Simulate success
  async function handleSimulateSuccess() {
    setSimulating(true)
    await new Promise(r => setTimeout(r, 1800))
    router.push(`/booking/sukses?code=${bookingCode}&name=${encodeURIComponent(destinationName)}&date=${visitDate}&count=${ticketCount}&total=${total}&payment=${selectedPayment}`)
  }

  const stepLabels = ['Detail', 'Pembayaran', 'Konfirmasi']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)', padding: '2rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/destinasi" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <ArrowLeft size={15} /> Kembali
          </Link>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, marginBottom: '0.5rem' }}>
            {step === 1 ? '🎟️ Detail Pemesanan' : step === 2 ? '💳 Metode Pembayaran' : '📋 Konfirmasi Pembayaran'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{destinationName}</p>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0', marginTop: '1.25rem', maxWidth: '380px' }}>
            {stepLabels.map((label, i) => {
              const stepNum = i + 1
              const active = step >= stepNum
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: active ? '#FF6B35' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'white', transition: 'all 0.3s' }}>
                      {active && stepNum < step ? <CheckCheck size={14} /> : stepNum}
                    </div>
                    <span style={{ fontSize: '0.6rem', marginTop: '4px', color: active ? '#FF6B35' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: '2px', background: step > stepNum ? '#FF6B35' : 'rgba(255,255,255,0.2)', margin: '0 6px', marginBottom: '14px', transition: 'all 0.3s' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr' : '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ========== STEP 1: Detail ========== */}
            {step === 1 && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ticket size={18} color="#FF6B35" /> Informasi Tiket
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#4A5568', marginBottom: '8px' }}>Tanggal Kunjungan *</label>
                      <input type="date" min={today} max={maxDate} value={visitDate} onChange={e => setVisitDate(e.target.value)} className="input-field" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#4A5568', marginBottom: '8px' }}>Jumlah Tiket *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E5E9F0', background: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4A5568', fontFamily: 'Outfit, sans-serif' }}>−</button>
                        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1.3rem', color: '#1A2332' }}>
                          {ticketCount}
                          <div style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 500 }}>orang</div>
                        </div>
                        <button onClick={() => setTicketCount(Math.min(10, ticketCount + 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #0A4A5E', background: '#0A4A5E', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>+</button>
                      </div>
                    </div>
                    <div style={{ background: '#F0F7FA', borderRadius: '12px', padding: '0.875rem 1rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Users size={15} color="#0A4A5E" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <p style={{ fontSize: '0.8rem', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>
                        Tiket berlaku untuk <strong>{ticketCount} orang</strong>. Pastikan membawa bukti pemesanan (kode booking) saat tiba di lokasi.
                      </p>
                    </div>
                  </div>
                </div>

                {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '0.875rem 1rem', color: '#B91C1C', fontSize: '0.875rem' }}>⚠️ {error}</div>}

                <button
                  onClick={() => { if (!visitDate) { setError('Pilih tanggal kunjungan terlebih dahulu'); return } setError(''); setStep(2) }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                >
                  Lanjut ke Pembayaran <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* ========== STEP 2: Pilih Metode ========== */}
            {step === 2 && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#FF6B35" /> Pilih Metode Pembayaran
                  </h2>
                  {groups.map(group => (
                    <div key={group} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>{group}</div>
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

                {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '0.875rem 1rem', color: '#B91C1C', fontSize: '0.875rem' }}>⚠️ {error}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B98A9', fontSize: '0.78rem', padding: '0 0.5rem' }}>
                  <Shield size={14} color="#10B981" />
                  <span>Transaksi Anda dilindungi enkripsi SSL 256-bit</span>
                </div>

                <button
                  onClick={handleGoToInstructions}
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                >
                  {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</> : <>Bayar Rp {total.toLocaleString('id-ID')} <ChevronRight size={18} /></>}
                </button>

                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#8B98A9', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', textDecoration: 'underline' }}>
                  ← Kembali ubah detail
                </button>
              </>
            )}

            {/* ========== STEP 3: Konfirmasi & Instruksi ========== */}
            {step === 3 && paymentInfo && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

                {/* Left: Instructions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Payment header */}
                  <div style={{ background: paymentInfo.bg || '#F1F5F9', borderRadius: '20px', padding: '1.5rem', border: `1px solid ${paymentInfo.color}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: paymentInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.4rem' }}>{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '1rem', color: '#1A2332' }}>{paymentInfo.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>Selesaikan pembayaran sebelum waktu habis</div>
                      </div>
                      <div style={{ marginLeft: 'auto', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '50px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#D97706' }}>
                        ⏱ 15:00
                      </div>
                    </div>

                    {/* Total to pay */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8B98A9', fontWeight: 600, marginBottom: '3px' }}>TOTAL PEMBAYARAN</div>
                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: paymentInfo.color }}>Rp {total.toLocaleString('id-ID')}</div>
                      </div>
                      <CopyButton text={total.toString()} />
                    </div>
                  </div>

                  {/* QRIS display */}
                  {selectedPayment === 'qris' && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', margin: 0 }}>Scan QR Code Berikut</h3>
                      <FakeQRIS total={total} code={previewCode} />
                      <div style={{ fontSize: '0.78rem', color: '#8B98A9', textAlign: 'center', lineHeight: 1.5 }}>
                        Gunakan aplikasi <strong>GoPay, OVO, DANA, BCA Mobile, BRImo</strong> atau aplikasi e-wallet lainnya yang mendukung QRIS.
                      </div>
                    </div>
                  )}

                  {/* Bank transfer account info */}
                  {['transfer_bca', 'transfer_mandiri', 'transfer_bri'].includes(selectedPayment) && paymentInfo.accountNumber && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '1rem' }}>Rekening Tujuan</h3>
                      <div style={{ background: paymentInfo.bg, borderRadius: '14px', padding: '1rem 1.25rem', border: `1px solid ${paymentInfo.color}30` }}>
                        <div style={{ fontSize: '0.72rem', color: '#8B98A9', fontWeight: 600, marginBottom: '3px' }}>{paymentInfo.bankName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '2px', color: paymentInfo.color, fontFamily: 'monospace' }}>{paymentInfo.accountNumber}</div>
                          <CopyButton text={paymentInfo.accountNumber} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '4px', fontWeight: 600 }}>{paymentInfo.accountName}</div>
                      </div>
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '0.78rem', color: '#92400E' }}>
                        ⚠️ Pastikan jumlah transfer <strong>tepat Rp {total.toLocaleString('id-ID')}</strong> termasuk angka terakhir. Pembayaran tidak akan terverifikasi jika nominal berbeda.
                      </div>
                    </div>
                  )}

                  {/* E-wallet phone number */}
                  {['gopay', 'ovo', 'dana'].includes(selectedPayment) && paymentInfo.phoneNumber && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '1rem' }}>Nomor {paymentInfo.appName}</h3>
                      <div style={{ background: paymentInfo.bg, borderRadius: '14px', padding: '1rem 1.25rem', border: `1px solid ${paymentInfo.color}30` }}>
                        <div style={{ fontSize: '0.72rem', color: '#8B98A9', fontWeight: 600, marginBottom: '3px' }}>NOMOR TUJUAN TRANSFER</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '1px', color: paymentInfo.color, fontFamily: 'monospace' }}>{paymentInfo.phoneNumber}</div>
                          <CopyButton text={paymentInfo.phoneNumber} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '4px', fontWeight: 600 }}>a/n PT MLAKOOW WISATA INDONESIA</div>
                      </div>
                    </div>
                  )}

                  {/* Credit card form */}
                  {selectedPayment === 'visa' && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={16} color="#0A4A5E" /> Informasi Kartu
                      </h3>
                      {/* Card preview */}
                      <div style={{ background: 'linear-gradient(135deg, #1A2332 0%, #0A4A5E 100%)', borderRadius: '16px', padding: '1.25rem', color: 'white', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'absolute', right: '20px', bottom: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>KARTU KREDIT / DEBIT</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '4px', marginBottom: '0.75rem', color: cardNumber ? 'white' : 'rgba(255,255,255,0.3)' }}>
                          {cardNumber ? cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>NAMA</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{cardName || 'NAMA PEMEGANG KARTU'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>BERLAKU S/D</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{cardExpiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#4A5568', marginBottom: '6px' }}>Nomor Kartu</label>
                          <input
                            type="text" maxLength={19} placeholder="1234 5678 9012 3456"
                            value={cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                            onChange={e => setCardNumber(e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16))}
                            className="input-field" style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '2px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#4A5568', marginBottom: '6px' }}>Nama Pemegang Kartu</label>
                          <input type="text" placeholder="Sesuai nama di kartu" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} className="input-field" style={{ width: '100%' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#4A5568', marginBottom: '6px' }}>Tanggal Kadaluarsa</label>
                            <input type="text" maxLength={5} placeholder="MM/YY" value={cardExpiry} onChange={e => {
                              let v = e.target.value.replace(/\D/g, '')
                              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
                              setCardExpiry(v)
                            }} className="input-field" style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '2px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#4A5568', marginBottom: '6px' }}>CVV</label>
                            <input type="password" maxLength={3} placeholder="•••" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} className="input-field" style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '4px' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#8B98A9' }}>
                          <Lock size={12} /> Data kartu Anda dienkripsi dan tidak disimpan
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step-by-step instructions */}
                  <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '1rem' }}>Cara Pembayaran</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {paymentInfo.steps.map((step: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F0F7FA', border: '2px solid #0A4A5E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color: '#0A4A5E', flexShrink: 0, marginTop: '1px' }}>
                            {idx + 1}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: 1.6 }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* *** SIMULATE BUTTON *** */}
                  <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', borderRadius: '20px', padding: '1.5rem', border: '2px dashed #34D399' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                      <Zap size={16} color="#059669" fill="#059669" />
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#065F46' }}>Mode Demo</span>
                      <span style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: '50px', padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700, color: '#059669' }}>SIMULASI</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#047857', margin: '0 0 1rem', lineHeight: 1.5 }}>
                      Ini adalah tampilan demo. Klik tombol di bawah untuk mensimulasikan pembayaran berhasil dan melihat halaman konfirmasi tiket.
                    </p>
                    <button
                      onClick={handleSimulateSuccess}
                      disabled={simulating}
                      style={{
                        width: '100%', padding: '0.875rem', borderRadius: '14px',
                        background: simulating ? '#D1FAE5' : 'linear-gradient(135deg, #059669, #10B981)',
                        border: 'none', color: 'white', fontWeight: 800, fontSize: '0.95rem',
                        cursor: simulating ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: simulating ? 'none' : '0 6px 20px rgba(16,185,129,0.35)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {simulating
                        ? <><Loader size={18} color="#059669" style={{ animation: 'spin 1s linear infinite' }} /> <span style={{ color: '#059669' }}>Memproses Simulasi...</span></>
                        : <><Zap size={18} fill="white" /> Simulasikan Pembayaran Berhasil ✓</>
                      }
                    </button>
                  </div>

                  <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#8B98A9', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', textDecoration: 'underline' }}>
                    ← Ganti metode pembayaran
                  </button>
                </div>

                {/* Right: Order Summary */}
                <div style={{ position: 'sticky', top: '80px' }}>
                  <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '1.25rem' }}>📋 Ringkasan Pesanan</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>{destinationName}</div>
                        {visitDate && <div style={{ fontSize: '0.78rem', color: '#8B98A9', marginTop: '3px' }}>📅 {new Date(visitDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div>}
                      </div>
                      <div style={{ height: '1px', background: '#E5E9F0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: '#4A5568' }}>{ticketCount}x Tiket</span>
                        <span style={{ fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
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
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0A4A5E' }}>Rp {total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    {bookingCode && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F0F7FA', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#8B98A9', fontWeight: 600, marginBottom: '3px' }}>KODE BOOKING</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem', color: '#0A4A5E', letterSpacing: '2px' }}>{bookingCode}</div>
                      </div>
                    )}
                  </div>

                  {/* Security & tips */}
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #E5E9F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginBottom: '0.5rem' }}>
                      <Shield size={13} /> Transaksi Aman
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 1rem', color: '#8B98A9', fontSize: '0.72rem', lineHeight: 1.7 }}>
                      <li>Enkripsi SSL 256-bit</li>
                      <li>Data kartu tidak disimpan</li>
                      <li>Dilindungi sistem anti-fraud</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar for step 1 & 2 */}
          {step < 3 && (
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
                    <span style={{ fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
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
          )}
        </div>
      </div>

      <Footer />

      {error && step === 1 && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 24px rgba(239,68,68,0.3)', zIndex: 50, whiteSpace: 'nowrap' }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr 280px"],
          div[style*="grid-template-columns: 1fr 300px"] {
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
