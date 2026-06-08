'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarPlus, X, Check, Loader, Plus, ChevronRight,
  MapPin, Sparkles,
} from 'lucide-react'

interface CanvasItinerary {
  id: number
  title: string
  items: { destination: { id: number; name: string; mainImage: string; area: string } }[]
}

interface Props {
  destinationId: number
  destinationName: string
  destinationSlug: string
  trigger: ReactNode
  onSuccess?: (msg: string) => void
}

export default function ItineraryPickerModal({
  destinationId,
  destinationName,
  trigger,
  onSuccess,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [canvases, setCanvases] = useState<CanvasItinerary[]>([])
  const [loading, setLoading] = useState(false)

  // Sub-state: creating a new canvas
  const [creatingCanvas, setCreatingCanvas] = useState(false)
  const [newCanvasName, setNewCanvasName] = useState('')
  const [savingCanvas, setSavingCanvas] = useState(false)

  // Adding to existing canvas
  const [addingToId, setAddingToId] = useState<number | null>(null)
  const [addedToId, setAddedToId] = useState<number | null>(null)

  // Success toast
  const [successMsg, setSuccessMsg] = useState('')

  const overlayRef = useRef<HTMLDivElement>(null)

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    onSuccess?.(msg)
    setTimeout(() => {
      setSuccessMsg('')
      setOpen(false)
    }, 2200)
  }

  async function openModal() {
    // Require login
    const res = await fetch('/api/wishlist?check=0').catch(() => null)
    if (res?.status === 401) { router.push('/login'); return }

    setOpen(true)
    setCreatingCanvas(false)
    setNewCanvasName('')
    setSuccessMsg('')
    setAddedToId(null)
    setLoading(true)
    fetch('/api/itineraries?type=canvas')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setCanvases(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => { setCanvases([]); setLoading(false) })
  }

  function closeModal() {
    setOpen(false)
    setCreatingCanvas(false)
    setNewCanvasName('')
  }

  // Add destination to an existing canvas
  async function addToCanvas(canvasId: number, canvasTitle: string) {
    setAddingToId(canvasId)
    const res = await fetch(`/api/itineraries/${canvasId}/add-destination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationId }),
    })
    setAddingToId(null)
    if (res.ok) {
      setAddedToId(canvasId)
      showSuccess(`"${destinationName}" ditambahkan ke "${canvasTitle}" ✓`)
    }
  }

  // Create new canvas then immediately add destination
  async function createCanvasAndAdd() {
    const title = newCanvasName.trim()
    if (!title) return
    setSavingCanvas(true)

    // 1. Create canvas
    const createRes = await fetch('/api/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCanvas: true, title }),
    })
    if (!createRes.ok) { setSavingCanvas(false); return }
    const canvas = await createRes.json()

    // 2. Add destination to canvas
    await fetch(`/api/itineraries/${canvas.id}/add-destination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationId }),
    })

    setSavingCanvas(false)
    showSuccess(`"${destinationName}" ditambahkan ke "${title}" ✓`)
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (overlayRef.current && e.target === overlayRef.current) closeModal()
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') closeModal() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      {/* Trigger */}
      <span onClick={openModal} style={{ display: 'contents', cursor: 'pointer' }}>
        {trigger}
      </span>

      {/* Modal Overlay */}
      {open && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,20,40,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px',
              width: '100%', maxWidth: '420px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Success state */}
            {successMsg ? (
              <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem', boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                }}>
                  <Check size={28} color="white" strokeWidth={3} />
                </div>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2332', margin: 0, lineHeight: 1.5 }}>
                  {successMsg}
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CalendarPlus size={18} color="#0A4A5E" />
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2332' }}>
                        Tambah ke Itinerary
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#8B98A9', margin: 0, lineHeight: 1.4 }}>
                      Pilih kanvas untuk <strong style={{ color: '#1A2332' }}>{destinationName}</strong>
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{ background: '#F0F4F8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <X size={16} color="#4A5568" />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Create new canvas — inline form or button */}
                  {creatingCanvas ? (
                    <div style={{ background: '#F8FAFC', border: '1.5px solid #E5E9F0', borderRadius: '16px', padding: '1.25rem' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem' }}>
                        Nama Kanvas
                      </label>
                      <input
                        autoFocus
                        value={newCanvasName}
                        onChange={(e) => setNewCanvasName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createCanvasAndAdd() }}
                        placeholder="cth: Weekend Surabaya, Liburan Keluarga..."
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          padding: '0.7rem 1rem', borderRadius: '10px',
                          border: '1.5px solid #BAE6FD', fontSize: '0.9rem',
                          fontFamily: 'Outfit, sans-serif', outline: 'none',
                          marginBottom: '0.875rem',
                          background: 'white',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { setCreatingCanvas(false); setNewCanvasName('') }}
                          style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #E5E9F0', background: 'white', color: '#4A5568', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={createCanvasAndAdd}
                          disabled={!newCanvasName.trim() || savingCanvas}
                          style={{
                            flex: 2, padding: '0.65rem', borderRadius: '10px', border: 'none',
                            background: newCanvasName.trim() ? 'linear-gradient(135deg, #0A4A5E, #1E6FA8)' : '#E5E9F0',
                            color: newCanvasName.trim() ? 'white' : '#8B98A9',
                            fontWeight: 700, fontSize: '0.875rem',
                            cursor: newCanvasName.trim() ? 'pointer' : 'not-allowed',
                            fontFamily: 'Outfit, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          }}
                        >
                          {savingCanvas ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                          {savingCanvas ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingCanvas(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '1rem 1.25rem', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0A4A5E, #1E6FA8)',
                        border: 'none', color: 'white', cursor: 'pointer',
                        width: '100%', textAlign: 'left',
                        fontFamily: 'Outfit, sans-serif',
                        boxShadow: '0 4px 16px rgba(10,74,94,0.3)',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,74,94,0.4)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,74,94,0.3)' }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Plus size={20} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>Buat Kanvas Baru</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>Beri nama, lalu tambah destinasi sesukamu</div>
                      </div>
                      <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </button>
                  )}

                  {/* Divider */}
                  {!creatingCanvas && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '1px', background: '#E5E9F0' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B98A9', letterSpacing: '0.06em' }}>
                        ATAU PILIH KANVAS
                      </span>
                      <div style={{ flex: 1, height: '1px', background: '#E5E9F0' }} />
                    </div>
                  )}

                  {/* Existing canvases */}
                  {!creatingCanvas && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                      {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#8B98A9' }}>
                          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      ) : canvases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9' }}>
                          <Sparkles size={28} style={{ marginBottom: '8px', color: '#CBD5E0' }} />
                          <p style={{ fontSize: '0.875rem', margin: 0 }}>Belum ada kanvas tersimpan.</p>
                          <p style={{ fontSize: '0.8rem', margin: '4px 0 0', color: '#A0ADB8' }}>Buat kanvas baru di atas!</p>
                        </div>
                      ) : (
                        canvases.map((canvas) => {
                          const isAdded = addedToId === canvas.id
                          const isAdding = addingToId === canvas.id
                          const alreadyHas = canvas.items.some((i) => i.destination.id === destinationId)
                          return (
                            <div
                              key={canvas.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '0.875rem 1rem', borderRadius: '14px',
                                border: isAdded ? '1.5px solid #10B981' : '1.5px solid #E5E9F0',
                                background: isAdded ? '#F0FDF4' : '#FAFBFC',
                                cursor: alreadyHas || isAdded ? 'default' : 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onClick={() => { if (!alreadyHas && !isAdded && !isAdding) addToCanvas(canvas.id, canvas.title) }}
                              onMouseEnter={(e) => { if (!alreadyHas && !isAdded) e.currentTarget.style.borderColor = '#0A4A5E' }}
                              onMouseLeave={(e) => { if (!isAdded) e.currentTarget.style.borderColor = '#E5E9F0' }}
                            >
                              {/* Mini thumbnail grid */}
                              <div style={{ display: 'flex', flexShrink: 0 }}>
                                {canvas.items.slice(0, 3).map((item, idx) => (
                                  <img
                                    key={item.destination.id}
                                    src={item.destination.mainImage}
                                    alt=""
                                    style={{
                                      width: '32px', height: '32px', borderRadius: '8px',
                                      objectFit: 'cover', border: '2px solid white',
                                      marginLeft: idx > 0 ? '-8px' : 0,
                                    }}
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                ))}
                                {canvas.items.length === 0 && (
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={14} color="#8B98A9" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {canvas.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>
                                  {canvas.items.length} destinasi{alreadyHas ? ' · sudah ada' : ''}
                                </div>
                              </div>

                              {/* Status */}
                              <div style={{ flexShrink: 0 }}>
                                {isAdding ? (
                                  <Loader size={16} color="#0A4A5E" style={{ animation: 'spin 1s linear infinite' }} />
                                ) : isAdded || alreadyHas ? (
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={14} color="white" strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #E5E9F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={14} color="#0A4A5E" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(12px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
