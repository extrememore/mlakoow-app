'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Calendar, MapPin } from 'lucide-react'

interface BookingButtonProps {
  destinationId: number
  destinationName: string
  ticketPrice: number
}

export default function BookingButton({ destinationId, destinationName, ticketPrice }: BookingButtonProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div
        style={{
          height: '48px',
          borderRadius: '50px',
          background: '#F0F4F8',
          animation: 'pulse 1.5s ease-in-out infinite',
          marginBottom: '0.75rem',
        }}
      />
    )
  }

  // Free destinations: no payment needed, just plan a visit
  if (ticketPrice === 0) {
    return (
      <div style={{ marginBottom: '0.75rem' }}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxSizing: 'border-box',
          }}
        >
          <MapPin size={17} />
          Destinasi Gratis – Kunjungi Langsung
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#8B98A9', margin: '6px 0 0' }}>
          Tidak perlu pemesanan tiket
        </p>
      </div>
    )
  }

  // Paid destinations: link to booking page
  if (session?.user) {
    return (
      <Link
        href={`/booking?destinationId=${destinationId}&name=${encodeURIComponent(destinationName)}&price=${ticketPrice}`}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', display: 'flex' }}
      >
        <Calendar size={18} />
        Pesan Tiket Sekarang
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="btn-primary"
      style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', display: 'flex' }}
    >
      Login untuk Pesan Tiket
    </Link>
  )
}
