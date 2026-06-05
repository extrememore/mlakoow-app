'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ticket, Calendar, User, MapPin, Loader, CheckCircle, XCircle, Clock } from 'lucide-react'

interface BookingDetail {
  id: number
  bookingCode: string
  visitDate: string
  ticketCount: number
  totalPrice: number
  status: string
  createdAt: string
  user: { name: string; email: string }
  destination: {
    name: string
    slug: string
    area: string
    mainImage: string
    ticketPrice: number
    category: { name: string; icon: string }
  }
}

const statusOptions = [
  { value: 'pending', label: '⏳ Pending', color: '#D97706', bg: '#FEF3C7' },
  { value: 'confirmed', label: '✓ Confirmed', color: '#059669', bg: '#D1FAE5' },
  { value: 'cancelled', label: '✗ Cancelled', color: '#DC2626', bg: '#FEE2E2' },
]

export default function AdminBookingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    fetch(`/api/admin/bookings/${id}`)
      .then(r => r.json())
      .then(data => {
        setBooking(data)
        setNewStatus(data.status)
        setLoading(false)
      })
  }, [id])

  async function updateStatus() {
    if (!booking || newStatus === booking.status) return
    setSaving(true)
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setBooking(prev => prev ? { ...prev, status: newStatus } : prev)
    setSaving(false)
  }

  if (loading) return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <Loader size={32} color="#0A4A5E" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!booking) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#8B98A9' }}>
      Booking tidak ditemukan. <Link href="/admin/bookings" style={{ color: '#0A4A5E' }}>Kembali</Link>
    </div>
  )

  const currentStatus = statusOptions.find(s => s.value === booking.status)!

  return (
    <div style={{ padding: '2rem', maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B98A9', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Kembali ke Pemesanan
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Detail Pemesanan</h1>
            <code style={{ fontSize: '0.85rem', color: '#0A4A5E', background: '#E0F2FE', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>{booking.bookingCode}</code>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '6px 14px', borderRadius: '10px', background: currentStatus.bg, color: currentStatus.color }}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Destination */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
          <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#8B98A9', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destinasi</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img src={booking.destination.mainImage} alt={booking.destination.name} style={{ width: '70px', height: '60px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2332', marginBottom: '4px' }}>{booking.destination.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#8B98A9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={12} /> {booking.destination.area}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#8B98A9', marginTop: '2px' }}>
                {booking.destination.category.icon} {booking.destination.category.name} • Harga tiket: Rp {booking.destination.ticketPrice.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
          <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#8B98A9', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pemesan</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A4A5E', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
              {booking.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1A2332', fontSize: '0.95rem' }}>{booking.user.name}</div>
              <div style={{ color: '#8B98A9', fontSize: '0.85rem' }}>{booking.user.email}</div>
            </div>
          </div>
        </div>

        {/* Booking info */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
          <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#8B98A9', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rincian Pemesanan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Tanggal Kunjungan', val: new Date(booking.visitDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
              { label: 'Jumlah Tiket', val: `${booking.ticketCount} tiket`, icon: Ticket },
              { label: 'Total Pembayaran', val: `Rp ${booking.totalPrice.toLocaleString('id-ID')}`, icon: Ticket },
              { label: 'Tanggal Pesan', val: new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Clock },
            ].map(item => (
              <div key={item.label} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: '#1A2332', fontSize: '0.95rem' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Update Status */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: `2px solid ${booking.status === 'pending' ? '#FEF3C7' : '#E5E9F0'}` }}>
          <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#8B98A9', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ubah Status Pemesanan</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {statusOptions.map(s => (
              <button
                key={s.value}
                onClick={() => setNewStatus(s.value)}
                style={{
                  padding: '8px 18px', borderRadius: '50px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                  border: `2px solid ${newStatus === s.value ? s.color : '#E5E9F0'}`,
                  background: newStatus === s.value ? s.bg : 'white',
                  color: newStatus === s.value ? s.color : '#8B98A9',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={updateStatus}
            disabled={saving || newStatus === booking.status}
            style={{
              padding: '10px 24px', borderRadius: '50px', background: newStatus === booking.status ? '#E5E9F0' : '#0A4A5E', color: newStatus === booking.status ? '#8B98A9' : 'white',
              border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: newStatus === booking.status ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
