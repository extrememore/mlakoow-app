'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import MapWrapper from '@/components/ui/MapWrapper'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { QRModal } from '@/components/ui/QRModal'
import {
  MapPin,
  Clock,
  Wallet,
  Calendar,
  ArrowLeft,
  Bus,
  Trash2,
  Star,
  Loader,
  AlertTriangle,
  Zap,
  Ticket,
  Check,
  CheckCircle,
  X,
  CreditCard,
  Shield,
} from 'lucide-react'

const PAYMENT_METHODS = [
  { id: 'transfer_bca', name: 'Transfer BCA', icon: '🏦' },
  { id: 'transfer_mandiri', name: 'Transfer Mandiri', icon: '🏦' },
  { id: 'transfer_bri', name: 'Transfer BRI', icon: '🏦' },
  { id: 'gopay', name: 'GoPay', icon: '💚' },
  { id: 'ovo', name: 'OVO', icon: '💜' },
  { id: 'qris', name: 'QRIS', icon: '📱' },
]

interface ItineraryDetail {
  id: number
  title: string
  duration: number
  budget: number
  area: string
  totalEstimatedCost: number
  notes: string | null
  startDate: string | null
  createdAt: string
  items: {
    id: number
    order: number
    estimatedVisitTime: number
    estimatedCost: number
    transportNote: string | null
    destination: {
      id: number
      name: string
      slug: string
      area: string
      mainImage: string
      rating: number
      ticketPrice: number
      estimatedDuration: number
      openHour: string
      closeHour: string
      lat: number
      lng: number
      category: { name: string; icon: string; color: string }
    }
  }[]
}

export default function ItineraryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Booking state
  const [tripDate, setTripDate] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [ticketCount, setTicketCount] = useState(1)
  const [payment, setPayment] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Existing bookings (fetched from API)
  const [existingBookings, setExistingBookings] = useState<{
    destinationId: number
    bookingCode: string
    visitDate: string
    ticketCount: number
    totalPrice: number
    status: string
  }[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/itineraries/${id}`).then((res) => {
        if (res.status === 401) { router.push('/login'); return null }
        if (res.status === 404) { setError('Itinerary tidak ditemukan'); return null }
        return res.json()
      }),
      fetch('/api/bookings').then((res) => res.ok ? res.json() : []).catch(() => []),
    ])
      .then(([itinData, bookingsData]) => {
        if (itinData) setItinerary(itinData)
        if (Array.isArray(bookingsData)) {
          setExistingBookings(bookingsData.map((b: Record<string, unknown>) => ({
            destinationId: (b.destination as Record<string, unknown> & { id?: number })?.id || b.destinationId as number,
            bookingCode: b.bookingCode as string,
            visitDate: b.visitDate as string,
            ticketCount: b.ticketCount as number,
            totalPrice: b.totalPrice as number,
            status: b.status as string,
          })))
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat itinerary')
        setLoading(false)
      })
  }, [id, router])

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/profil')
    } else {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Group items by day (order 1-based, estimated 4 per day)
  function getDay(order: number, duration: number) {
    const itemsPerDay = Math.ceil((itinerary?.items.length || 1) / duration)
    return Math.ceil(order / itemsPerDay)
  }

  // Assign time slots starting from 08:00
  function getStartTime(order: number, duration: number): string {
    const itemsPerDay = Math.ceil((itinerary?.items.length || 1) / duration)
    const posInDay = (order - 1) % itemsPerDay
    const startHour = 8 + posInDay * 2
    return `${String(startHour).padStart(2, '0')}:00`
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#8B98A9' }}>
            <Loader size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Memuat itinerary...</p>
          </div>
        </div>
        <Footer />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#8B98A9', padding: '2rem' }}>
            <AlertTriangle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{error || 'Itinerary tidak ditemukan'}</p>
            <Link href="/profil" className="btn-primary">
              Kembali ke Profil
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const days = Array.from({ length: itinerary.duration }, (_, i) => i + 1)
  const itemsPerDay = Math.ceil(itinerary.items.length / itinerary.duration)
  const totalTransport = itinerary.items.length * 25000
  const totalFood = itinerary.duration * 50000
  const grandTotal = itinerary.totalEstimatedCost + totalTransport + totalFood

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 50%, #0D6E84 100%)', padding: '2.5rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Back */}
          <Link
            href="/profil"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> Kembali ke Profil
          </Link>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '50px', padding: '6px 14px', marginBottom: '1rem', color: '#FF8C5E', fontWeight: 600, fontSize: '0.8rem' }}>
            <Zap size={13} /> DETAIL ITINERARY
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            {itinerary.title}
          </h1>

          {/* Meta info */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} /> {itinerary.duration} hari
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={14} /> {itinerary.area}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Wallet size={14} /> Budget Rp {itinerary.budget.toLocaleString('id-ID')}
            </span>

            {/* Trip start date — highlighted if exists */}
            {itinerary.startDate ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255, 107, 53, 0.2)', border: '1px solid rgba(255,107,53,0.4)',
                borderRadius: '50px', padding: '3px 10px',
                color: '#FF8C5E', fontWeight: 700, fontSize: '0.8rem',
              }}>
                🗓️ Trip: {new Date(itinerary.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                {itinerary.duration > 1 && (
                  <> — {new Date(new Date(itinerary.startDate).getTime() + (itinerary.duration - 1) * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</>
                )}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.6, fontStyle: 'italic', fontSize: '0.8rem' }}>
                <Calendar size={13} /> Tanggal trip belum ditentukan
              </span>
            )}

            {/* Created at — subtle */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              <Clock size={12} /> Dibuat {new Date(itinerary.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Destinasi', value: itinerary.items.length },
              { label: 'Est. Biaya', value: `Rp ${(itinerary.totalEstimatedCost / 1000).toFixed(0)}K` },
              { label: 'Total Estimasi', value: `Rp ${(grandTotal / 1000).toFixed(0)}K` },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Day-by-day */}
          {days.map((day) => {
            const dayItems = itinerary.items.filter((_, idx) => Math.floor(idx / itemsPerDay) + 1 === day)
            if (dayItems.length === 0) return null

            return (
              <div key={day} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 4px 16px rgba(10,74,94,0.05)' }}>
                {/* Day header */}
                <div style={{ background: '#F0F7FA', padding: '1rem 1.5rem', borderBottom: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0A4A5E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>
                    {day}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>Hari ke-{day}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>{dayItems.length} destinasi</div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {dayItems.map((item, idx) => {
                    const startHour = 8 + idx * Math.ceil(item.estimatedVisitTime / 60 + 0.5)
                    const startTime = `${String(Math.min(startHour, 20)).padStart(2, '0')}:00`

                    return (
                      <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        {/* Timeline dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>
                            {idx + 1}
                          </div>
                          {idx < dayItems.length - 1 && (
                            <div style={{ width: '2px', flex: 1, minHeight: '40px', background: '#E5E9F0', margin: '4px 0' }} />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          {/* Transport note */}
                          {item.transportNote && (
                            <div style={{ fontSize: '0.78rem', color: '#8B98A9', fontStyle: 'italic', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Bus size={12} /> {item.transportNote}
                            </div>
                          )}

                          {/* Destination card */}
                          <Link
                            href={`/wisata/${item.destination.slug}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <div style={{ display: 'flex', gap: '1rem', background: '#F8F6F2', borderRadius: '14px', padding: '1rem', border: '1px solid #E5E9F0', transition: 'all 0.2s', cursor: 'pointer' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#EEF6FF')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#F8F6F2')}
                            >
                              <img
                                src={item.destination.mainImage}
                                alt={item.destination.name}
                                style={{ width: '80px', height: '65px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 600 }}>
                                    🕐 {startTime}
                                  </span>
                                  <span className="badge" style={{ background: item.destination.category.color + '22', color: item.destination.category.color, fontSize: '0.65rem' }}>
                                    {item.destination.category.icon} {item.destination.category.name}
                                  </span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A2332', marginBottom: '6px' }}>
                                  {item.destination.name}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#8B98A9', flexWrap: 'wrap' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={11} /> {item.estimatedVisitTime} mnt
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: item.estimatedCost === 0 ? '#10B981' : '#0A4A5E', fontWeight: 600 }}>
                                    <Wallet size={11} />
                                    {item.estimatedCost === 0 ? 'Gratis' : `Rp ${item.estimatedCost.toLocaleString('id-ID')}`}
                                  </span>
                                  {existingBookings.some((b) => b.destinationId === item.destination.id) && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10B981', fontWeight: 700, background: '#ECFDF5', padding: '1px 8px', borderRadius: '50px', fontSize: '0.7rem' }}>
                                      <CheckCircle size={10} /> Tiket Dipesan
                                    </span>
                                  )}
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <MapPin size={11} /> {item.destination.area}
                                  </span>
                                  {item.destination.rating > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B' }}>
                                      <Star size={11} fill="#F59E0B" /> {item.destination.rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Route Map */}
          {itinerary.items.some(item => item.destination.lat && item.destination.lng) && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', border: '1px solid #E5E9F0', boxShadow: '0 4px 16px rgba(10,74,94,0.05)' }}>
              <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.875rem', fontSize: '1.05rem' }}>🗺️ Peta Rute Perjalanan</h3>
              <MapWrapper
                pins={itinerary.items
                  .filter(item => item.destination.lat && item.destination.lng)
                  .map((item, idx) => ({
                    lat: item.destination.lat,
                    lng: item.destination.lng,
                    label: item.destination.name,
                    order: idx + 1,
                  }))}
                height="320px"
                zoom={12}
                showRoute={true}
              />
              <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#8B98A9' }}>Garis putus-putus menunjukkan urutan rute kunjungan destinasi</p>
            </div>
          )}

          {/* Budget Breakdown */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', boxShadow: '0 4px 16px rgba(10,74,94,0.05)' }}>
            <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '1.25rem', fontSize: '1.1rem' }}>💰 Estimasi Biaya Perjalanan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#4A5568' }}>Pengeluaran Destinasi ({itinerary.items.length} tempat)</span>
                <strong style={{ color: '#1A2332' }}>Rp {itinerary.totalEstimatedCost.toLocaleString('id-ID')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#4A5568' }}>Transportasi (estimasi)</span>
                <strong style={{ color: '#1A2332' }}>Rp {totalTransport.toLocaleString('id-ID')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#4A5568' }}>Makan & minuman (estimasi)</span>
                <strong style={{ color: '#1A2332' }}>Rp {totalFood.toLocaleString('id-ID')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid #0A4A5E', marginTop: '0.25rem' }}>
                <span style={{ fontWeight: 800, color: '#1A2332', fontSize: '1rem' }}>Total Estimasi</span>
                <strong style={{ color: '#0A4A5E', fontSize: '1.1rem' }}>Rp {grandTotal.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          {(() => {
            const paidItems = itinerary.items.filter((i) => i.destination.ticketPrice > 0)
            if (paidItems.length === 0) return null

            const bookedIds = existingBookings.map((b) => b.destinationId)
            const allBooked = paidItems.every((i) => bookedIds.includes(i.destination.id))
            const unbookedPaidItems = paidItems.filter((i) => !bookedIds.includes(i.destination.id))
            const bookedPaidItems = paidItems.filter((i) => bookedIds.includes(i.destination.id))

            function getBookingDate(order: number): string {
              if (!tripDate) return ''
              const day = getDay(order, itinerary!.duration)
              const d = new Date(tripDate + 'T00:00:00')
              d.setDate(d.getDate() + day - 1)
              return d.toISOString().split('T')[0]
            }

            const selectedTotal = unbookedPaidItems
              .filter((i) => selectedIds.includes(i.destination.id))
              .reduce((sum, i) => sum + i.destination.ticketPrice * ticketCount, 0)

            async function handleBooking() {
              if (!tripDate) { setBookingError('Pilih tanggal mulai trip'); return }
              if (selectedIds.length === 0) { setBookingError('Pilih minimal satu destinasi'); return }
              if (!payment) { setBookingError('Pilih metode pembayaran'); return }
              setBookingLoading(true)
              setBookingError('')

              const items = unbookedPaidItems
                .filter((i) => selectedIds.includes(i.destination.id))
                .map((i) => ({
                  destinationId: i.destination.id,
                  visitDate: getBookingDate(i.order),
                  ticketCount,
                }))

              try {
                const res = await fetch('/api/bookings/bulk', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items }),
                })
                if (res.ok) {
                  const result = await res.json()
                  const dataParam = encodeURIComponent(JSON.stringify(result.bookings))
                  router.push(`/booking/bulk-sukses?data=${dataParam}&itineraryId=${id}`)
                } else {
                  setBookingError('Gagal memproses. Coba lagi.')
                  setBookingLoading(false)
                }
              } catch {
                setBookingError('Kesalahan koneksi.')
                setBookingLoading(false)
              }
            }

            return (
              <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', boxShadow: '0 4px 16px rgba(10,74,94,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: allBooked ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #FF6B35, #E5522A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {allBooked ? <CheckCircle size={20} color="white" /> : <Ticket size={20} color="white" />}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: '#1A2332', margin: 0, fontSize: '1.1rem' }}>
                      {allBooked ? 'Semua Tiket Sudah Dipesan!' : 'Pesan Tiket Destinasi'}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#8B98A9', margin: 0 }}>
                      {allBooked
                        ? `${bookedPaidItems.length} tiket berbayar sudah dikonfirmasi`
                        : `${unbookedPaidItems.length} destinasi belum dipesan`}
                    </p>
                  </div>
                </div>

                {/* Already booked destinations */}
                {bookedPaidItems.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10B981', marginBottom: '0.5rem' }}>
                      ✅ Tiket Sudah Dipesan ({bookedPaidItems.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {bookedPaidItems.map((item) => {
                        const booking = existingBookings.find((b) => b.destinationId === item.destination.id)
                        return (
                          <div
                            key={item.destination.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.6rem',
                              padding: '0.55rem 0.8rem', borderRadius: '12px',
                              background: '#F0FDF4', border: '1px solid #A7F3D0',
                            }}
                          >
                            <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                            <img src={item.destination.mainImage} alt={item.destination.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A2332' }}>{item.destination.name}</div>
                              {booking && (
                                <div style={{ fontSize: '0.65rem', color: '#047857' }}>
                                  Kode: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{booking.bookingCode}</span>
                                  {' · '}{new Date(booking.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  {' · '}{booking.ticketCount} orang
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#047857' }}>
                                Rp {item.destination.ticketPrice.toLocaleString('id-ID')}
                              </div>
                              {booking && (
                                <QRModal
                                  bookingCode={booking.bookingCode}
                                  destinationName={item.destination.name}
                                  visitDate={booking.visitDate}
                                  ticketCount={booking.ticketCount}
                                  totalPrice={booking.totalPrice}
                                  status={booking.status}
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Booking form for un-booked destinations */}
                {!allBooked && (
                  <>
                    {/* Trip date */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem' }}>
                        <Calendar size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
                        Tanggal Mulai Trip
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                      {tripDate && (
                        <div style={{ fontSize: '0.75rem', color: '#0A4A5E', fontWeight: 600, marginTop: '4px' }}>
                          {new Date(tripDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {itinerary.duration > 1 && ` — ${new Date(new Date(tripDate + 'T00:00:00').getTime() + (itinerary.duration - 1) * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`}
                        </div>
                      )}
                    </div>

                    {/* Destination checkboxes — only un-booked */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem' }}>
                        Belum Dipesan ({selectedIds.length}/{unbookedPaidItems.length} dipilih)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {unbookedPaidItems.map((item) => {
                          const isSelected = selectedIds.includes(item.destination.id)
                          const day = getDay(item.order, itinerary!.duration)
                          const visitDate = getBookingDate(item.order)
                          return (
                            <div
                              key={item.destination.id}
                              onClick={() => setSelectedIds((prev) => isSelected ? prev.filter((x) => x !== item.destination.id) : [...prev, item.destination.id])}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.6rem 0.8rem', borderRadius: '12px',
                                border: `2px solid ${isSelected ? '#0A4A5E' : '#E5E9F0'}`,
                                background: isSelected ? '#F0F7FA' : 'white',
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}
                            >
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '6px',
                                border: `2px solid ${isSelected ? '#0A4A5E' : '#CBD5E0'}`,
                                background: isSelected ? '#0A4A5E' : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, transition: 'all 0.15s',
                              }}>
                                {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                              </div>
                              <img src={item.destination.mainImage} alt={item.destination.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2332' }}>{item.destination.name}</div>
                                <div style={{ fontSize: '0.68rem', color: '#8B98A9' }}>
                                  Hari {day}{visitDate && ` · ${new Date(visitDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                                </div>
                              </div>
                              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0A4A5E', flexShrink: 0 }}>
                                Rp {item.destination.ticketPrice.toLocaleString('id-ID')}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Ticket count */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem' }}>Jumlah Tiket</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #E5E9F0', background: 'white', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4A5568', fontFamily: 'Outfit, sans-serif' }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2332' }}>{ticketCount}</span>
                        <button onClick={() => setTicketCount(Math.min(10, ticketCount + 1))} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #0A4A5E', background: '#0A4A5E', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>+</button>
                        <span style={{ fontSize: '0.78rem', color: '#8B98A9' }}>orang</span>
                      </div>
                    </div>

                    {/* Payment */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CreditCard size={13} /> Metode Pembayaran
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                        {PAYMENT_METHODS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setPayment(m.id)}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                              padding: '0.55rem 0.4rem', borderRadius: '10px',
                              border: `2px solid ${payment === m.id ? '#0A4A5E' : '#E5E9F0'}`,
                              background: payment === m.id ? '#F0F7FA' : 'white',
                              cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: payment === m.id ? '#0A4A5E' : '#4A5568' }}>{m.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {bookingError && (
                      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '0.6rem 0.8rem', color: '#B91C1C', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                        ⚠️ {bookingError}
                      </div>
                    )}

                    {/* Total */}
                    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.85rem', border: '1px solid #E5E9F0', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#4A5568' }}>{selectedIds.length} destinasi × {ticketCount} orang</span>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0A4A5E' }}>Rp {selectedTotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#8B98A9' }}>
                        <Shield size={11} color="#10B981" /> Transaksi dilindungi enkripsi SSL
                      </div>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={bookingLoading || selectedIds.length === 0}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', opacity: bookingLoading || selectedIds.length === 0 ? 0.6 : 1 }}
                    >
                      {bookingLoading ? (
                        <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
                      ) : (
                        <><Ticket size={16} /> Pesan {selectedIds.length} Tiket Sekaligus</>
                      )}
                    </button>
                  </>
                )}
              </div>
            )
          })()}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/profil" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Kembali ke Profil
            </Link>
            <Link href="/itinerary" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Buat Itinerary Baru
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1.25rem', borderRadius: '50px', border: '2px solid #FCA5A5', background: 'white', color: '#EF4444', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem' }}
            >
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1A2332', marginBottom: '0.75rem' }}>Hapus Itinerary?</h3>
            <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Itinerary <strong>"{itinerary.title}"</strong> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', borderRadius: '50px', background: '#EF4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                {deleting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
