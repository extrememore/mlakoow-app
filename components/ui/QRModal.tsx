'use client'

import { useState } from 'react'
import { X, QrCode, CheckCircle } from 'lucide-react'

interface QRModalProps {
  bookingCode: string
  destinationName: string
  visitDate: string
  ticketCount: number
  totalPrice: number
  status: string
}

// Generate a deterministic pseudo-QR grid from booking code
function QRGrid({ code, size = 180 }: { code: string; size?: number }) {
  const cells = 21 // 21x21 grid (like QR module pattern)
  const segments = code.split('').map((c) => c.charCodeAt(0))

  // Finder pattern positions (top-left, top-right, bottom-left corners)
  const isFinderCell = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7
    const inTopRight = r < 7 && c >= cells - 7
    const inBottomLeft = r >= cells - 7 && c < 7
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null
    const localR = inTopRight ? r : inBottomLeft ? r - (cells - 7) : r
    const localC = inTopRight ? c - (cells - 7) : inBottomLeft ? c : c
    const ring = Math.max(Math.abs(localR - 3), Math.abs(localC - 3))
    return ring <= 3 && ring !== 2 // solid border + center
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(${cells}, 1fr)`,
        gap: '0px',
        background: 'white',
        padding: '12px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}
    >
      {Array.from({ length: cells * cells }).map((_, i) => {
        const row = Math.floor(i / cells)
        const col = i % cells
        const finder = isFinderCell(row, col)

        let filled: boolean
        if (finder !== null) {
          filled = finder
        } else {
          const seed = (segments[(row * cells + col) % segments.length] + row * 13 + col * 7) % 3
          filled = seed !== 1
        }

        return (
          <div
            key={i}
            style={{
              background: filled ? '#1A2332' : 'white',
              borderRadius: '1px',
            }}
          />
        )
      })}
    </div>
  )
}

export function QRModal({ bookingCode, destinationName, visitDate, ticketCount, totalPrice, status }: QRModalProps) {
  const [open, setOpen] = useState(false)

  const statusLabel = status === 'confirmed' ? '✓ Terkonfirmasi' : status === 'pending' ? '⏳ Menunggu' : '✕ Dibatalkan'
  const statusColor = status === 'confirmed' ? '#10B981' : status === 'pending' ? '#F59E0B' : '#EF4444'

  const formattedDate = new Date(visitDate).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px', borderRadius: '8px',
          background: '#F0F7FA', border: '1px solid #B8D8E8',
          color: '#0A4A5E', fontSize: '0.72rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#0A4A5E'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#F0F7FA'; e.currentTarget.style.color = '#0A4A5E' }}
        title="Tampilkan QR Code"
      >
        <QrCode size={13} /> QR Code
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '360px', width: '100%',
            overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            animation: 'qrPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)',
              padding: '1.25rem 1.5rem', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>MLAKOOW E-TICKET</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3 }}>{destinationName}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  marginTop: '6px', background: `${statusColor}33`,
                  border: `1px solid ${statusColor}66`, borderRadius: '50px',
                  padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, color: 'white',
                }}>
                  {statusLabel}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: 'white', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Perforated divider */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'var(--bg, #F8F6F2)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', left: '-10px', border: '1px solid #E5E9F0' }} />
              <div style={{ flex: 1, borderTop: '2px dashed #E5E9F0', margin: '0 20px' }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', right: '-10px', border: '1px solid #E5E9F0' }} />
            </div>

            {/* QR Code + booking details */}
            <div style={{ padding: '1.5rem', background: 'var(--bg, #F8F6F2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {/* QR */}
              <div style={{ position: 'relative' }}>
                <QRGrid code={bookingCode} size={200} />
                {/* Center logo overlay */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: '#0A4A5E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 4px white',
                }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '-0.5px' }}>MLK</span>
                </div>
              </div>

              {/* Booking code */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.06em' }}>KODE BOOKING</div>
                <div style={{
                  fontFamily: 'monospace', fontWeight: 900, fontSize: '1.3rem',
                  letterSpacing: '3px', color: '#0A4A5E',
                  background: '#E8F4F8', padding: '6px 16px', borderRadius: '10px',
                }}>{bookingCode}</div>
              </div>

              {/* Trip details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', width: '100%' }}>
                {[
                  { label: 'TANGGAL', value: formattedDate },
                  { label: 'TIKET', value: `${ticketCount} Orang` },
                  { label: 'TOTAL', value: totalPrice === 0 ? 'GRATIS' : `Rp ${totalPrice.toLocaleString('id-ID')}` },
                  { label: 'STATUS', value: statusLabel },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'white', borderRadius: '10px', padding: '0.6rem 0.75rem', border: '1px solid #E5E9F0' }}>
                    <div style={{ fontSize: '0.6rem', color: '#8B98A9', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1A2332', lineHeight: 1.3 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Instruction */}
              <div style={{
                background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px',
                padding: '0.65rem 1rem', display: 'flex', gap: '8px', alignItems: 'flex-start', width: '100%',
              }}>
                <CheckCircle size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '0.72rem', color: '#065F46', margin: 0, lineHeight: 1.5 }}>
                  Tunjukkan QR code ini atau kode booking kepada petugas saat tiba di lokasi.
                </p>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes qrPopIn {
              from { opacity: 0; transform: scale(0.85) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
