'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Plus, Loader, Check, ChevronRight, Calendar, MapPin, X } from 'lucide-react'

interface ItinerarySummary {
  id: number
  title: string
  duration: number
  area: string
  items: { id: number }[]
  startDate: string | null
}

interface ItineraryPickerModalProps {
  destinationId: number
  destinationName: string
  destinationSlug: string
  trigger?: React.ReactNode  // custom trigger element
}

export default function ItineraryPickerModal({
  destinationId,
  destinationName,
  destinationSlug,
  trigger,
}: ItineraryPickerModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const [addedTo, setAddedTo] = useState<number | null>(null)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError('')
    fetch('/api/itineraries')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setItineraries(data)
        setLoading(false)
      })
      .catch(() => { setError('Gagal memuat itinerary'); setLoading(false) })
  }, [open, router])

  async function addToItinerary(itineraryId: number) {
    setAdding(itineraryId)
    setError('')
    const res = await fetch(`/api/itineraries/${itineraryId}/add-destination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationId }),
    })
    const data = await res.json()
    if (res.ok) {
      setAddedTo(itineraryId)
      setTimeout(() => setOpen(false), 1500)
    } else {
      setError(data.error || 'Gagal menambahkan destinasi')
    }
    setAdding(null)
  }

  function handleCreateNew() {
    // Navigasi ke /itinerary dengan canvas pre-filled
    router.push(`/itinerary?canvas=${destinationId}`)
    setOpen(false)
  }

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
    setAddedTo(null)
    setError('')
  }

  return (
    <>
      {/* Trigger */}
      <span onClick={handleOpen} style={{ cursor: 'pointer' }}>
        {trigger ?? (
          <button
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', width: '100%', padding: '0.875rem',
              background: 'white', border: '1.5px solid #E5E9F0', borderRadius: '10px',
              fontWeight: 600, fontSize: '0.875rem', color: '#1A2332', cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif', transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0A4A5E')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E9F0')}
          >
            <CalendarPlus size={16} color="#0A4A5E" />
            + Tambah ke Itinerary
          </button>
        )}
      </span>

      {/* Modal Overlay */}
      {open && (
        <div
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99999, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px', padding: '2rem',
              width: '100%', maxWidth: '480px', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', gap: '1.25rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.2s ease',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1A2332', marginBottom: '4px' }}>
                  Tambah ke Itinerary
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#8B98A9' }}>
                  Pilih itinerary untuk <strong style={{ color: '#0A4A5E' }}>{destinationName}</strong>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: '#F0F4F8', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={16} color="#8B98A9" />
              </button>
            </div>

            {/* Buat Itinerary Baru */}
            <button
              onClick={handleCreateNew}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '1rem 1.25rem', borderRadius: '14px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #062E3A, #0A4A5E)',
                border: 'none', textAlign: 'left', width: '100%',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', marginBottom: '2px' }}>
                  Buat Itinerary Baru
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                  Mulai dari kanvas kosong, atur sendiri destinasinya
                </div>
              </div>
              <ChevronRight size={18} color="rgba(255,255,255,0.6)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E9F0' }} />
              <span style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 600, whiteSpace: 'nowrap' }}>
                ATAU PILIH YANG ADA
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E5E9F0' }} />
            </div>

            {/* Daftar Itinerary */}
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8B98A9' }}>
                  <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : itineraries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9', fontSize: '0.9rem' }}>
                  Belum ada itinerary tersimpan.<br />
                  <strong>Buat itinerary baru</strong> di atas!
                </div>
              ) : (
                itineraries.map((itin) => {
                  const isAdded = addedTo === itin.id
                  const isAdding = adding === itin.id
                  return (
                    <button
                      key={itin.id}
                      onClick={() => !isAdded && !isAdding && addToItinerary(itin.id)}
                      disabled={isAdded || isAdding}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '0.875rem 1rem', borderRadius: '14px', cursor: isAdded ? 'default' : 'pointer',
                        background: isAdded ? '#ECFDF5' : 'white',
                        border: `1.5px solid ${isAdded ? '#10B981' : '#E5E9F0'}`,
                        textAlign: 'left', width: '100%', fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { if (!isAdded) e.currentTarget.style.borderColor = '#0A4A5E' }}
                      onMouseLeave={(e) => { if (!isAdded) e.currentTarget.style.borderColor = '#E5E9F0' }}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: isAdded ? '#D1FAE5' : '#F0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isAdded ? <Check size={18} color="#10B981" /> : isAdding ? <Loader size={18} color="#0A4A5E" style={{ animation: 'spin 1s linear infinite' }} /> : <Calendar size={18} color="#0A4A5E" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isAdded ? '#059669' : '#1A2332', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isAdded ? '✓ Berhasil ditambahkan!' : itin.title}
                        </div>
                        {!isAdded && (
                          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#8B98A9' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Calendar size={10} /> {itin.duration} hari
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={10} /> {itin.area}
                            </span>
                            <span>{itin.items.length} destinasi</span>
                          </div>
                        )}
                      </div>
                      {!isAdded && !isAdding && <ChevronRight size={16} color="#8B98A9" style={{ flexShrink: 0 }} />}
                    </button>
                  )
                })
              )}

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem', color: '#DC2626', fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
