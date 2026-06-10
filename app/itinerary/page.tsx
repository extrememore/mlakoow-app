'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Zap,
  MapPin,
  Clock,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar,
  ArrowRight,
  Loader,
  Star,
  Bus,
  Navigation,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  ArrowUpDown,
  Ticket,
  CreditCard,
  Shield,
} from 'lucide-react'

const AREAS = ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat']

const PAYMENT_METHODS = [
  { id: 'transfer_bca', name: 'Transfer BCA', icon: '🏦', group: 'Transfer Bank' },
  { id: 'transfer_mandiri', name: 'Transfer Mandiri', icon: '🏦', group: 'Transfer Bank' },
  { id: 'transfer_bri', name: 'Transfer BRI', icon: '🏦', group: 'Transfer Bank' },
  { id: 'gopay', name: 'GoPay', icon: '💚', group: 'Dompet Digital' },
  { id: 'ovo', name: 'OVO', icon: '💜', group: 'Dompet Digital' },
  { id: 'qris', name: 'QRIS', icon: '📱', group: 'Dompet Digital' },
]

interface DestinationData {
  id: number
  name: string
  slug: string
  area: string
  mainImage: string
  rating: number
  ticketPrice: number
  estimatedDuration: number
  category: { id?: number; name: string; slug?: string; icon: string; color: string }
  categoryId?: number
}

interface ItineraryItem {
  destination: DestinationData
  order: number
  day: number
  startTime: string
  estimatedVisitTime: number
  estimatedCost: number
  transportNote: string
}

interface GeneratedItinerary {
  items: ItineraryItem[]
  totalCost: number
  totalTime: number
  duration: number
  summary: {
    destinations: number
    days: number
    estimatedBudget: number
    areas: string[]
  }
}

// Recalculate timeline after modifications
function recalcItems(items: ItineraryItem[], duration: number): ItineraryItem[] {
  const startHours = [9, 11, 14, 16]
  const destPerDay = Math.max(...items.map((i) => items.filter((x) => x.day === i.day).length), 1)

  // Re-group by day and fix ordering
  const byDay: Record<number, ItineraryItem[]> = {}
  items.forEach((item) => {
    if (!byDay[item.day]) byDay[item.day] = []
    byDay[item.day].push(item)
  })

  const result: ItineraryItem[] = []
  let globalOrder = 1

  for (let day = 1; day <= duration; day++) {
    const dayItems = byDay[day] || []
    dayItems.forEach((item, idx) => {
      const startHour = startHours[idx] || (9 + idx * 2)
      const prevName = idx === 0
        ? null
        : dayItems[idx - 1]?.destination.name

      result.push({
        ...item,
        order: globalOrder++,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        transportNote:
          idx === 0
            ? 'Mulai perjalanan dari lokasi Anda'
            : `Lanjut dari ${prevName} menggunakan Grab/Gojek`,
      })
    })
  }

  return result
}

function ItineraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<GeneratedItinerary | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)

  // Canvas: destinasi yang di-pin dari luar (via ?canvas=ID atau ?canvas=1,2,3)
  const [canvasDests, setCanvasDests] = useState<DestinationData[]>([])
  const [canvasLoading, setCanvasLoading] = useState(false)

  // User's saved canvases
  const [userCanvases, setUserCanvases] = useState<{ id: number; title: string; items: { destination: DestinationData }[] }[]>([])
  const [canvasesLoading, setCanvasesLoading] = useState(false)
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<Set<number>>(new Set())
  const [creatingNewCanvas, setCreatingNewCanvas] = useState(false)
  const [newCanvasName, setNewCanvasName] = useState('')
  const [savingNewCanvas, setSavingNewCanvas] = useState(false)

  // Trip start & end date (from Step 1 date range picker)
  const [tripStartDate, setTripStartDate] = useState('')
  const [tripEndDate, setTripEndDate] = useState('')

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([])
  const [bookingTicketCount, setBookingTicketCount] = useState(1)
  const [bookingPayment, setBookingPayment] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Editable items — the user's customized version of the generated itinerary
  const [editableItems, setEditableItems] = useState<ItineraryItem[]>([])

  // Suggestion state
  const [suggestions, setSuggestions] = useState<DestinationData[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestingFor, setSuggestingFor] = useState<{ day: number; slotIdx: number } | null>(null)

  // Add destination panel
  const [addingForDay, setAddingForDay] = useState<number | null>(null)
  const [addSearch, setAddSearch] = useState('')
  const [addCandidates, setAddCandidates] = useState<DestinationData[]>([])
  const [loadingAddCandidates, setLoadingAddCandidates] = useState(false)

  // Form state
  const [duration, setDuration] = useState(1)
  const [budget, setBudget] = useState(200000)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [maxDestinations, setMaxDestinations] = useState(4)

  const categories = [
    { id: 1, label: 'Alam', icon: '🌿', slug: 'alam' },
    { id: 2, label: 'Budaya', icon: '🎭', slug: 'budaya' },
    { id: 3, label: 'Kuliner', icon: '🍜', slug: 'kuliner' },
    { id: 4, label: 'Sejarah', icon: '🏛️', slug: 'sejarah' },
    { id: 5, label: 'Keluarga', icon: '👨‍👩‍👧', slug: 'keluarga' },
    { id: 6, label: 'Hidden Gem', icon: '💎', slug: 'hidden-gem' },
  ]
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])

  // Fetch canvas destinations from ?canvas=ID,ID2,ID3 query param
  useEffect(() => {
    const canvasParam = searchParams.get('canvas')
    if (!canvasParam) return
    const ids = canvasParam.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length === 0) return
    setCanvasLoading(true)
    Promise.all(
      ids.map((id) =>
        fetch(`/api/destinations/by-id/${id}`)
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then((results) => {
      const valid = results.filter(Boolean) as DestinationData[]
      setCanvasDests(valid)
      setCanvasLoading(false)
    })
  }, [searchParams])

  // Fetch user's saved canvases
  useEffect(() => {
    setCanvasesLoading(true)
    fetch('/api/itineraries?type=canvas')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setUserCanvases(Array.isArray(data) ? data : [])
        setCanvasesLoading(false)
      })
      .catch(() => setCanvasesLoading(false))
  }, [])

  function toggleCanvasSelection(canvasId: number) {
    setSelectedCanvasIds((prev) => {
      const next = new Set(prev)
      if (next.has(canvasId)) next.delete(canvasId)
      else next.add(canvasId)
      return next
    })
  }

  async function createNewCanvas() {
    const title = newCanvasName.trim()
    if (!title) return
    setSavingNewCanvas(true)
    const res = await fetch('/api/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCanvas: true, title }),
    })
    if (res.ok) {
      const canvas = await res.json()
      setUserCanvases((prev) => [canvas, ...prev])
      setCreatingNewCanvas(false)
      setNewCanvasName('')
    }
    setSavingNewCanvas(false)
  }

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // Live summary computed from editableItems
  const liveSummary = useMemo(() => {
    const totalCost = editableItems.reduce((sum, item) => sum + item.estimatedCost, 0)
    const totalTime = editableItems.reduce((sum, item) => sum + item.estimatedVisitTime, 0)
    const areas = [...new Set(editableItems.map((i) => i.destination.area))]
    return {
      destinations: editableItems.length,
      totalCost,
      totalTime,
      areas,
      grandTotal: totalCost + editableItems.length * 25000 + duration * 50000,
    }
  }, [editableItems, duration])

  async function generateItinerary() {
    setLoading(true)

    // Kumpulkan semua pinned destinations: dari canvas URL param + dari canvas yang dipilih user
    const selectedCanvasItems = userCanvases
      .filter((c) => selectedCanvasIds.has(c.id))
      .flatMap((c) => c.items.map((i) => i.destination))
    const allPinned = [...canvasDests, ...selectedCanvasItems].filter(
      (d, idx, arr) => arr.findIndex((x) => x.id === d.id) === idx // dedupe
    )

    const res = await fetch('/api/itineraries/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration,
        budget,
        area: selectedAreas.length > 0 ? selectedAreas.join(',') : 'Semua Area',
        areas: selectedAreas,
        categoryIds: selectedCategoryIds,
        maxDestinations: Math.max(maxDestinations, allPinned.length),
        pinnedDestinationIds: allPinned.map((d) => d.id),
      }),
    })
    const data = await res.json()

    // Inject pinned destinations yang belum masuk dari API
    let items = data.items as ItineraryItem[]
    allPinned.forEach((pinned, idx) => {
      const alreadyIn = items.some((i) => i.destination.id === pinned.id)
      if (!alreadyIn) {
        const pinnedItem: ItineraryItem = {
          destination: pinned,
          order: idx,
          day: Math.min(idx + 1, duration),
          startTime: '09:00',
          estimatedVisitTime: pinned.estimatedDuration,
          estimatedCost: pinned.ticketPrice,
          transportNote: idx === 0 ? 'Mulai perjalanan dari lokasi Anda' : 'Lanjut menggunakan Grab/Gojek',
        }
        items = [pinnedItem, ...items]
      }
    })

    setGenerated(data)
    setEditableItems(recalcItems(items, duration))
    setSavedId(null)
    setLoading(false)
    setStep(3)
  }

  // --- Smart Customization Functions ---

  function removeItem(day: number, slotIdx: number) {
    const byDay = editableItems.filter((i) => i.day === day)
    const target = byDay[slotIdx]
    if (!target) return

    const newItems = editableItems.filter(
      (i) => !(i.day === target.day && i.destination.id === target.destination.id)
    )
    setEditableItems(recalcItems(newItems, duration))
    setSavedId(null) // Reset save state since items changed
  }

  function moveItem(day: number, slotIdx: number, direction: 'up' | 'down') {
    const newItems = [...editableItems]
    const dayItems = newItems.filter((i) => i.day === day)
    const swapIdx = direction === 'up' ? slotIdx - 1 : slotIdx + 1
    if (swapIdx < 0 || swapIdx >= dayItems.length) return

    // Find actual indices in the full array
    const aIdx = newItems.findIndex(
      (i) => i.day === day && i.destination.id === dayItems[slotIdx].destination.id
    )
    const bIdx = newItems.findIndex(
      (i) => i.day === day && i.destination.id === dayItems[swapIdx].destination.id
    )

    // Swap
    const temp = newItems[aIdx]
    newItems[aIdx] = newItems[bIdx]
    newItems[bIdx] = temp

    setEditableItems(recalcItems(newItems, duration))
    setSavedId(null)
  }

  async function fetchSuggestions(removedItem: ItineraryItem) {
    setLoadingSuggestions(true)
    const excludeIds = editableItems.map((i) => i.destination.id)
    const res = await fetch('/api/itineraries/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        excludeIds,
        categoryId: removedItem.destination.category?.id || removedItem.destination.categoryId,
        area: removedItem.destination.area,
        maxBudget: budget > 0 ? Math.floor(budget / maxDestinations) : undefined,
        limit: 5,
      }),
    })
    const data = await res.json()
    setSuggestions(data)
    setLoadingSuggestions(false)
  }

  function addSuggestionToSlot(dest: DestinationData, day: number) {
    const newItem: ItineraryItem = {
      destination: dest,
      order: 0,
      day,
      startTime: '09:00',
      estimatedVisitTime: dest.estimatedDuration,
      estimatedCost: dest.ticketPrice,
      transportNote: '',
    }
    const newItems = [...editableItems, newItem]
    setEditableItems(recalcItems(newItems, duration))
    setSuggestingFor(null)
    setSuggestions([])
    setSavedId(null)
  }

  async function fetchAddCandidates(day: number) {
    setLoadingAddCandidates(true)
    const excludeIds = editableItems.map((i) => i.destination.id)
    const res = await fetch('/api/itineraries/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        excludeIds,
        areas: selectedAreas.length > 0 ? selectedAreas : undefined,
        maxBudget: budget > 0 ? Math.floor(budget / maxDestinations) : undefined,
        limit: 10,
      }),
    })
    const data = await res.json()
    setAddCandidates(data)
    setLoadingAddCandidates(false)
  }

  function addDestination(dest: DestinationData, day: number) {
    const newItem: ItineraryItem = {
      destination: dest,
      order: 0,
      day,
      startTime: '09:00',
      estimatedVisitTime: dest.estimatedDuration,
      estimatedCost: dest.ticketPrice,
      transportNote: '',
    }
    const newItems = [...editableItems, newItem]
    setEditableItems(recalcItems(newItems, duration))
    setAddingForDay(null)
    setAddCandidates([])
    setAddSearch('')
    setSavedId(null)
  }

  // --- Save ---
  async function saveItinerary() {
    if (editableItems.length === 0) return
    setSaving(true)
    const res = await fetch('/api/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Trip Surabaya ${duration} Hari — ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
        duration,
        budget,
        area: selectedAreas.length > 0 ? selectedAreas.join(', ') : 'Semua Area',
        totalEstimatedCost: liveSummary.totalCost,
        startDate: tripStartDate || null,
        items: editableItems.map((item) => ({
          destinationId: item.destination.id,
          order: item.order,
          estimatedVisitTime: item.estimatedVisitTime,
          estimatedCost: item.estimatedCost,
          transportNote: item.transportNote,
        })),
      }),
    })

    if (res.status === 401) {
      window.location.href = '/login'
      return
    }

    const saved = await res.json()
    setSavedId(saved.id)
    setSaving(false)

    // Check if there are paid destinations — auto show booking modal
    const NON_BOOKING_SLUGS = ['kuliner', 'cafe', 'hiburan', 'oleh-oleh']
    const paidItems = editableItems.filter(
      (i) => i.estimatedCost > 0 && !NON_BOOKING_SLUGS.includes(i.destination.category.slug ?? '')
    )
    if (paidItems.length > 0) {
      setSelectedBookingIds(paidItems.map((i) => i.destination.id))
      setShowBookingModal(true)
    }
  }

  // --- Bulk Booking ---
  function getVisitDate(day: number): string {
    if (!tripStartDate) return ''
    const d = new Date(tripStartDate + 'T00:00:00')
    d.setDate(d.getDate() + day - 1)
    return d.toISOString().split('T')[0]
  }

  // Categories that are NOT tourism venues and should NOT be booked as ticket destinations
  const NON_BOOKING_CATEGORY_SLUGS = ['kuliner', 'cafe', 'hiburan', 'oleh-oleh']

  const paidEditableItems = editableItems.filter((i) =>
    i.estimatedCost > 0 &&
    !NON_BOOKING_CATEGORY_SLUGS.includes(i.destination.category.slug ?? '')
  )

  const selectedBookingTotal = paidEditableItems
    .filter((i) => selectedBookingIds.includes(i.destination.id))
    .reduce((sum, i) => sum + i.estimatedCost * bookingTicketCount, 0)

  async function handleBulkBooking() {
    if (!tripStartDate) { setBookingError('Pilih tanggal mulai trip terlebih dahulu'); return }
    if (selectedBookingIds.length === 0) { setBookingError('Pilih minimal satu destinasi'); return }
    if (!bookingPayment) { setBookingError('Pilih metode pembayaran'); return }

    setBookingLoading(true)
    setBookingError('')

    const items = paidEditableItems
      .filter((i) => selectedBookingIds.includes(i.destination.id))
      .map((i) => ({
        destinationId: i.destination.id,
        visitDate: getVisitDate(i.day),
        ticketCount: bookingTicketCount,
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
        router.push(`/booking/bulk-sukses?data=${dataParam}&itineraryId=${savedId}`)
      } else {
        setBookingError('Gagal memproses booking. Coba lagi.')
        setBookingLoading(false)
      }
    } catch {
      setBookingError('Terjadi kesalahan koneksi.')
      setBookingLoading(false)
    }
  }

  const days = Array.from({ length: duration }, (_, i) => i + 1)

  // Filtered add candidates for search
  const filteredAddCandidates = addSearch.trim()
    ? addCandidates.filter((d) =>
        d.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        d.area.toLowerCase().includes(addSearch.toLowerCase()) ||
        d.category.name.toLowerCase().includes(addSearch.toLowerCase())
      )
    : addCandidates

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 50%, #0D6E84 100%)',
          padding: '3rem 1.5rem',
          color: 'white',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,107,53,0.15)',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '50px',
              padding: '8px 18px',
              marginBottom: '1.25rem',
              color: '#FF8C5E',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <Zap size={14} /> Smart Itinerary Generator
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Buat Itinerary Perjalanan Cerdas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
            Masukkan preferensi kamu dan sistem akan menyusun rencana perjalanan yang efisien & hemat waktu di Surabaya
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {['Preferensi', 'Kategori', 'Kustomisasi'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: step > i + 1 ? '#10B981' : step === i + 1 ? '#FF6B35' : 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'white',
                    border: step === i + 1 ? '2px solid rgba(255,255,255,0.5)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  {step > i + 1 ? <Check size={16} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: step === i + 1 ? 'white' : 'rgba(255,255,255,0.5)',
                    fontWeight: step === i + 1 ? 600 : 400,
                  }}
                >
                  {s}
                </span>
                {i < 2 && (
                  <div style={{ width: '40px', height: '2px', background: step > i + 1 ? '#10B981' : 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Section */}
      {step === 1 && (
        <div style={{ maxWidth: '800px', margin: '2rem auto 0', padding: '0 1.5rem', width: '100%' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', boxShadow: '0 4px 20px rgba(10,74,94,0.06)', overflow: 'hidden' }}>
          {/* Canvas header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', margin: 0 }}>📌 Kanvas Itinerary</h2>
              <p style={{ fontSize: '0.78rem', color: '#8B98A9', margin: '2px 0 0' }}>Pilih kanvas — destinasinya otomatis masuk ke Smart Itinerary</p>
            </div>
            {!creatingNewCanvas && (
              <button
                onClick={() => setCreatingNewCanvas(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: '#F0F7FA', border: '1.5px solid #BAE6FD', color: '#0A4A5E', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                <Plus size={14} /> Buat Kanvas Baru
              </button>
            )}
          </div>

          {/* New canvas form */}
          {creatingNewCanvas && (
            <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFF', borderBottom: '1px solid #E5E9F0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                autoFocus
                value={newCanvasName}
                onChange={(e) => setNewCanvasName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createNewCanvas(); if (e.key === 'Escape') { setCreatingNewCanvas(false); setNewCanvasName('') } }}
                placeholder="Nama kanvas, cth: Weekend Surabaya..."
                style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', border: '1.5px solid #BAE6FD', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
              />
              <button onClick={() => { setCreatingNewCanvas(false); setNewCanvasName('') }} style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: '1.5px solid #E5E9F0', background: 'white', color: '#4A5568', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>Batal</button>
              <button
                onClick={createNewCanvas}
                disabled={!newCanvasName.trim() || savingNewCanvas}
                style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: newCanvasName.trim() ? '#0A4A5E' : '#E5E9F0', color: newCanvasName.trim() ? 'white' : '#8B98A9', fontWeight: 700, fontSize: '0.8rem', cursor: newCanvasName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
              >
                {savingNewCanvas ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />} Simpan
              </button>
            </div>
          )}

          {/* Canvas list */}
          <div style={{ padding: '1rem 1.5rem' }}>
            {canvasesLoading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9' }}>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : userCanvases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9' }}>
                <div style={{ fontSize: '0.875rem' }}>Belum ada kanvas — buat kanvas baru di atas untuk menyimpan destinasi pilihanmu.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {userCanvases.map((canvas) => {
                  const isSelected = selectedCanvasIds.has(canvas.id)
                  return (
                    <div
                      key={canvas.id}
                      onClick={() => toggleCanvasSelection(canvas.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '0.875rem 1rem', borderRadius: '14px',
                        border: isSelected ? '2px solid #0A4A5E' : '1.5px solid #E5E9F0',
                        background: isSelected ? '#EFF8FC' : '#FAFBFC',
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: isSelected ? '0 2px 10px rgba(10,74,94,0.12)' : 'none',
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: isSelected ? 'none' : '2px solid #D1D5DB', background: isSelected ? '#0A4A5E' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {isSelected && <Check size={13} color="white" strokeWidth={3} />}
                      </div>
                      {/* Destination thumbnails */}
                      <div style={{ display: 'flex', flexShrink: 0 }}>
                        {canvas.items.slice(0, 4).map((item, idx) => (
                          <img key={item.destination.id} src={item.destination.mainImage} alt="" style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover', border: '2px solid white', marginLeft: idx > 0 ? '-8px' : 0 }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        ))}
                        {canvas.items.length === 0 && (
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={13} color="#8B98A9" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#0A4A5E' : '#1A2332' }}>{canvas.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>
                          {canvas.items.length === 0 ? 'Belum ada destinasi' : `${canvas.items.length} destinasi`}
                          {canvas.items.length > 0 && ` · ${canvas.items.slice(0, 2).map((i) => i.destination.name.split(' ')[0]).join(', ')}${canvas.items.length > 2 ? '...' : ''}`}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0A4A5E', background: '#BAE6FD', padding: '3px 8px', borderRadius: '50px', flexShrink: 0 }}>Dipilih</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {selectedCanvasIds.size > 0 && (
              <div style={{ marginTop: '0.875rem', padding: '0.75rem 1rem', background: '#EFF8FC', borderRadius: '12px', fontSize: '0.8rem', color: '#0A4A5E', fontWeight: 600 }}>
                ✓ {selectedCanvasIds.size} kanvas dipilih — semua destinasinya akan otomatis masuk ke itinerary yang dibuat
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '1.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        {/* STEP 1 */}

        {step === 1 && (
          <div style={{ background: 'white', borderRadius: '28px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 12px 40px rgba(10,74,94,0.08)' }}>
            {/* Step 1 Header gradient */}
            <div style={{ background: 'linear-gradient(135deg, #0A4A5E 0%, #1E6FA8 60%, #2A8FD4 100%)', padding: '2rem 2.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem', position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '1.25rem' }}>🗓️</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Langkah 1 dari 2</div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0 }}>Preferensi Perjalanan</h2>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', margin: 0, position: 'relative', maxWidth: '400px' }}>
                Atur kapan, kemana, dan sebesar apa budget trip impianmu
              </p>
            </div>
            {/* Content pulled up over header */}
            <div style={{ padding: '0 2.5rem 2.5rem', marginTop: '-2.5rem', position: 'relative' }}>

            {/* Canvas banner — shown when destination was pre-loaded */}
            {/* Canvas banner — shown when destinations were pre-loaded from wishlist/detail */}
            {(canvasDests.length > 0 || canvasLoading) && (
              <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1.5px solid #93C5FD', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                {canvasLoading ? (
                  <div style={{ color: '#3B82F6', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memuat destinasi...
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.08em' }}>
                        📌 {canvasDests.length} DESTINASI DARI WISHLIST
                      </div>
                      <button
                        onClick={() => setCanvasDests([])}
                        style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={12} /> Hapus semua
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {canvasDests.map((d) => (
                        <div
                          key={d.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', borderRadius: '50px', padding: '4px 10px 4px 4px', border: '1px solid #BFDBFE', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                        >
                          <img src={d.mainImage} alt={d.name} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E40AF', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                          <button
                            onClick={() => setCanvasDests((prev) => prev.filter((x) => x.id !== d.id))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93C5FD', padding: '0', lineHeight: 1, marginLeft: '2px' }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.625rem' }}>
                      Semua destinasi ini akan otomatis masuk di itinerary yang dihasilkan
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {/* Date range picker */}
              <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.5rem', border: '1px solid #EEF1F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.35rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A4A5E, #1E6FA8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem' }}>📅</span>
                  </div>
                  <label style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', margin: 0 }}>
                    Kapan kamu mau Mlakoow?
                  </label>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#8B98A9', marginBottom: '1.25rem', marginLeft: '42px' }}>
                  Pilih tanggal mulai & selesai — durasi otomatis dihitung (maks 7 hari)
                </p>

                {/* Date Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginLeft: '42px' }}>
                  {/* Start date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={tripStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]}
                      onChange={(e) => {
                        const start = e.target.value
                        setTripStartDate(start)
                        if (tripEndDate) {
                          const diff = Math.round((new Date(tripEndDate + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) / 86400000)
                          const days = diff + 1
                          if (days < 1 || days > 7) setTripEndDate('')
                        }
                        if (tripEndDate && e.target.value) {
                          const diff = Math.round((new Date(tripEndDate + 'T00:00:00').getTime() - new Date(e.target.value + 'T00:00:00').getTime()) / 86400000)
                          const days = diff + 1
                          if (days >= 1 && days <= 7) setDuration(days)
                        }
                      }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '0.75rem 1rem', borderRadius: '14px',
                        border: `2px solid ${tripStartDate ? '#0A4A5E' : '#E5E9F0'}`,
                        background: tripStartDate ? '#F0F7FA' : 'white',
                        fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                        fontWeight: 600, color: '#1A2332', outline: 'none', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                    {tripStartDate && (
                      <div style={{ fontSize: '0.72rem', color: '#0A4A5E', fontWeight: 600, marginTop: '4px' }}>
                        {new Date(tripStartDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                    )}
                  </div>

                  {/* End date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={tripEndDate}
                      min={tripStartDate ? tripStartDate : new Date().toISOString().split('T')[0]}
                      max={tripStartDate
                        ? new Date(new Date(tripStartDate + 'T00:00:00').getTime() + 6 * 86400000).toISOString().split('T')[0]
                        : new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]}
                      disabled={!tripStartDate}
                      onChange={(e) => {
                        const end = e.target.value
                        setTripEndDate(end)
                        if (tripStartDate && end) {
                          const diff = Math.round((new Date(end + 'T00:00:00').getTime() - new Date(tripStartDate + 'T00:00:00').getTime()) / 86400000)
                          const days = diff + 1
                          if (days >= 1 && days <= 7) setDuration(days)
                        }
                      }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '0.75rem 1rem', borderRadius: '14px',
                        border: `2px solid ${tripEndDate ? '#0A4A5E' : '#E5E9F0'}`,
                        background: tripEndDate ? '#F0F7FA' : !tripStartDate ? '#F8FAFC' : 'white',
                        fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                        fontWeight: 600, color: '#1A2332', outline: 'none',
                        cursor: tripStartDate ? 'pointer' : 'not-allowed',
                        opacity: tripStartDate ? 1 : 0.5,
                        transition: 'all 0.2s',
                      }}
                    />
                    {tripEndDate && (
                      <div style={{ fontSize: '0.72rem', color: '#0A4A5E', fontWeight: 600, marginTop: '4px' }}>
                        {new Date(tripEndDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live duration result */}
                {tripStartDate && tripEndDate ? (
                  <div style={{
                    marginTop: '1.25rem', marginLeft: '42px', display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'linear-gradient(135deg, #0A4A5E, #1E6FA8)',
                    borderRadius: '14px', padding: '0.875rem 1.25rem',
                    boxShadow: '0 4px 16px rgba(10,74,94,0.2)',
                  }}>
                    <span style={{ fontSize: '1.6rem' }}>🎉</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', marginBottom: '2px' }}>
                        Trip {duration} Hari — Siap jelajahi Surabaya!
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 500 }}>
                        Estimasi ~{duration * maxDestinations} destinasi · {new Date(tripStartDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – {new Date(tripEndDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    {duration === 7 && (
                      <span style={{ fontSize: '0.7rem', background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '50px', fontWeight: 800, flexShrink: 0, border: '1px solid #FDE68A' }}>
                        MAX
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: '1.25rem', marginLeft: '42px', padding: '0.875rem 1rem', background: '#FFF7ED', borderRadius: '12px', border: '1px dashed #FCD34D', fontSize: '0.85rem', color: '#92400E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👆</span> {!tripStartDate ? 'Pilih tanggal mulai dahulu' : 'Lalu pilih tanggal selesai (maks +7 hari)'}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.5rem', border: '1px solid #EEF1F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.9rem' }}>💰</span>
                    </div>
                    <label style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', margin: 0 }}>
                      Budget tiket per orang
                    </label>
                  </div>
                  {/* Live value badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 16px', borderRadius: '50px', fontWeight: 800,
                    fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif',
                    background: budget === 0
                      ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
                      : budget <= 200000
                      ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
                      : budget <= 500000
                      ? 'linear-gradient(135deg, #FFF7ED, #FED7AA)'
                      : 'linear-gradient(135deg, #FFF1F2, #FFE4E6)',
                    color: budget === 0 ? '#065F46'
                      : budget <= 200000 ? '#1E40AF'
                      : budget <= 500000 ? '#C2410C'
                      : '#9F1239',
                    border: `1.5px solid ${budget === 0 ? '#A7F3D0' : budget <= 200000 ? '#BFDBFE' : budget <= 500000 ? '#FDBA74' : '#FECDD3'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s',
                  }}>
                    <span style={{ fontSize: '1.15rem' }}>
                      {budget === 0 ? '🎁' : budget <= 100000 ? '💚' : budget <= 300000 ? '💙' : budget <= 600000 ? '🧡' : '💎'}
                    </span>
                    {budget === 0 ? 'Gratis saja' : `Rp ${budget.toLocaleString('id-ID')}`}
                  </div>
                </div>

                <div style={{ marginLeft: '42px' }}>
                  {/* Budget category label */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em',
                      color: budget === 0 ? '#10B981' : budget <= 200000 ? '#3B82F6' : budget <= 500000 ? '#F97316' : '#E11D48',
                      textTransform: 'uppercase',
                      background: budget === 0 ? '#ECFDF5' : budget <= 200000 ? '#EFF6FF' : budget <= 500000 ? '#FFF7ED' : '#FFF1F2',
                      padding: '4px 10px', borderRadius: '6px',
                    }}>
                      {budget === 0 ? '✦ Hanya destinasi gratis'
                        : budget <= 150000 ? '✦ Budget hemat'
                        : budget <= 350000 ? '✦ Budget moderat'
                        : budget <= 700000 ? '✦ Budget premium'
                        : '✦ All-inclusive / Luxury'}
                    </span>
                  </div>

                  {/* Gradient slider track wrapper */}
                  <div style={{ position: 'relative', paddingBottom: '0.5rem', marginTop: '1rem' }}>
                    <div style={{
                      position: 'absolute', top: '10px', left: 0, right: 0, height: '8px',
                      borderRadius: '50px', pointerEvents: 'none',
                      background: 'linear-gradient(to right, #10B981 0%, #3B82F6 25%, #F97316 60%, #E11D48 100%)',
                      opacity: 0.2,
                    }} />
                    <div style={{
                      position: 'absolute', top: '10px', left: 0, height: '8px',
                      borderRadius: '50px', pointerEvents: 'none',
                      width: `${(budget / 1000000) * 100}%`,
                      background: budget === 0 ? '#10B981'
                        : budget <= 200000 ? 'linear-gradient(to right, #10B981, #3B82F6)'
                        : budget <= 500000 ? 'linear-gradient(to right, #10B981, #3B82F6, #F97316)'
                        : 'linear-gradient(to right, #10B981, #3B82F6, #F97316, #E11D48)',
                      transition: 'width 0.15s, background 0.3s',
                      boxShadow: '0 0 8px rgba(59,130,246,0.4)',
                    }} />
                    <input
                      type="range"
                      min={0}
                      max={1000000}
                      step={25000}
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                      style={{
                        width: '100%', height: '28px', cursor: 'pointer',
                        appearance: 'none', background: 'transparent',
                        position: 'relative', zIndex: 1,
                      }}
                      className="budget-slider"
                    />
                  </div>

                  {/* Tick marks */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#8B98A9', marginTop: '4px', paddingBottom: '0.5rem' }}>
                    {['Gratis', 'Rp 250rb', 'Rp 500rb', 'Rp 750rb', 'Rp 1jt'].map((label, i) => (
                      <span
                        key={label}
                        onClick={() => setBudget(i === 0 ? 0 : i === 1 ? 250000 : i === 2 ? 500000 : i === 3 ? 750000 : 1000000)}
                        style={{
                          cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s',
                          color: (i === 0 && budget === 0) || (i === 1 && budget === 250000) || (i === 2 && budget === 500000) || (i === 3 && budget === 750000) || (i === 4 && budget === 1000000)
                            ? '#0A4A5E' : '#CBD5E1',
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Quick preset chips */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {[
                      { label: '🎁 Gratis', value: 0, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
                      { label: '💚 Rp 100rb', value: 100000, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
                      { label: '💙 Rp 250rb', value: 250000, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
                      { label: '🧡 Rp 500rb', value: 500000, color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
                      { label: '💎 Rp 1jt', value: 1000000, color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' },
                    ].map(({ label, value, color, bg, border }) => (
                      <button
                        key={value}
                        onClick={() => setBudget(value)}
                        style={{
                          padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem',
                          fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: 'Outfit, sans-serif',
                          border: budget === value ? `2px solid ${color}` : '2px solid #E5E9F0',
                          background: budget === value ? bg : 'white',
                          color: budget === value ? color : '#64748B',
                          transform: budget === value ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: budget === value ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <style>{`
                  .budget-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: white;
                    border: 4px solid #0A4A5E;
                    box-shadow: 0 4px 12px rgba(10,74,94,0.35);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
                  }
                  .budget-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 6px 16px rgba(10,74,94,0.45);
                  }
                  .budget-slider::-webkit-slider-runnable-track {
                    height: 8px; border-radius: 50px;
                    background: transparent;
                  }
                  .budget-slider::-moz-range-thumb {
                    width: 22px; height: 22px;
                    border-radius: 50%;
                    background: white;
                    border: 4px solid #0A4A5E;
                    box-shadow: 0 4px 12px rgba(10,74,94,0.35);
                    cursor: pointer;
                  }
                  .budget-slider::-moz-range-track {
                    height: 8px; border-radius: 50px; background: transparent;
                  }
                `}</style>
              </div>

              {/* Area — multi-select */}
              <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.5rem', border: '1px solid #EEF1F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.35rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem' }}>📍</span>
                  </div>
                  <label style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', margin: 0 }}>
                    Area tujuan di Surabaya
                  </label>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#8B98A9', marginBottom: '1rem', marginLeft: '42px' }}>
                  Pilih satu atau lebih area — kosongkan untuk semua area
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginLeft: '42px' }}>
                  {AREAS.map((a) => {
                    const isSelected = selectedAreas.includes(a)
                    return (
                      <button
                        key={a}
                        onClick={() =>
                          setSelectedAreas((prev) =>
                            prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                          )
                        }
                        style={{
                          padding: '0.55rem 1.1rem',
                          borderRadius: '50px',
                          border: isSelected ? '2px solid #0A4A5E' : '2px solid #E5E9F0',
                          background: isSelected ? '#0A4A5E' : 'white',
                          color: isSelected ? 'white' : '#4A5568',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          fontFamily: 'Outfit, sans-serif',
                          transition: 'all 0.18s',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        {isSelected && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                        {a}
                      </button>
                    )
                  })}
                </div>
                {/* Selected summary */}
                <div style={{ marginTop: '0.6rem', marginLeft: '42px', fontSize: '0.8rem', color: '#8B98A9' }}>
                  {selectedAreas.length === 0
                    ? '🌍 Semua area Surabaya akan diikutsertakan'
                    : `📍 ${selectedAreas.length} area dipilih: ${selectedAreas.join(' • ')}`}
                </div>
              </div>

              {/* Max destinations per day */}
              <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.5rem', border: '1px solid #EEF1F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF6B35, #E84D1C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem' }}>🎯</span>
                  </div>
                  <label style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', margin: 0 }}>
                    Destinasi per hari: <span style={{ color: '#FF6B35' }}>{maxDestinations} tempat</span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { n: 2, label: 'Santai', desc: 'Lebih banyak waktu tiap tempat' },
                    { n: 3, label: 'Sedang', desc: 'Keseimbangan sempurna' },
                    { n: 4, label: 'Aktif', desc: 'Banyak eksplorasi' },
                    { n: 5, label: 'Petualang', desc: 'Maksimalkan trip!' },
                  ].map(({ n, label, desc }) => (
                    <button
                      key={n}
                      onClick={() => setMaxDestinations(n)}
                      style={{
                        flex: 1,
                        padding: '0.875rem 0.5rem',
                        borderRadius: '16px',
                        border: maxDestinations === n ? '2px solid #FF6B35' : '2px solid #E5E9F0',
                        background: maxDestinations === n ? 'linear-gradient(135deg, #FF6B35, #E84D1C)' : 'white',
                        color: maxDestinations === n ? 'white' : '#1A2332',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        boxShadow: maxDestinations === n ? '0 4px 14px rgba(255,107,53,0.35)' : 'none',
                        transform: maxDestinations === n ? 'translateY(-2px)' : 'translateY(0)',
                      }}
                    >
                      <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
                        {n === 2 ? '🌿' : n === 3 ? '⚡' : n === 4 ? '🚀' : '🔥'}
                      </div>
                      <div>{n}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8, marginTop: '2px' }}>{label}</div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '0.875rem', fontSize: '0.78rem', color: '#8B98A9', textAlign: 'center' }}>
                  {maxDestinations === 2 ? '☕ Cocok buat yang suka santai dan menikmati tiap destinasi' :
                   maxDestinations === 3 ? '⚡ Pilihan paling populer — tidak terlalu padat, tidak terlalu longgar' :
                   maxDestinations === 4 ? '🚀 Buat kamu yang energik dan ingin explore banyak tempat' :
                   '🔥 Mode petualang — penuh aktivitas dari pagi sampai malam!'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!tripStartDate || !tripEndDate}
              style={{
                marginTop: '2rem', width: '100%', justifyContent: 'center',
                padding: '1.1rem', fontSize: '1rem', fontWeight: 800,
                borderRadius: '18px', border: 'none', cursor: (!tripStartDate || !tripEndDate) ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif',
                background: (!tripStartDate || !tripEndDate)
                  ? '#E5E9F0'
                  : 'linear-gradient(135deg, #0A4A5E 0%, #1E6FA8 60%, #FF6B35 200%)',
                color: (!tripStartDate || !tripEndDate) ? '#8B98A9' : 'white',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: (!tripStartDate || !tripEndDate) ? 'none' : '0 8px 24px rgba(10,74,94,0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.2s',
                opacity: 1,
              }}
              onMouseEnter={(e) => { if (tripStartDate && tripEndDate) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(10,74,94,0.4)' } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = tripStartDate && tripEndDate ? '0 8px 24px rgba(10,74,94,0.3)' : 'none' }}
            >
              {!tripStartDate || !tripEndDate
                ? <><span>📅</span> Pilih tanggal perjalanan dahulu</>
                : <><span style={{ fontSize: '1.1rem' }}>🚀</span> Lanjut Pilih Minat — Trip {duration} Hari <ChevronRight size={18} /></>}
            </button>
          </div>
        </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '28px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 12px 40px rgba(10,74,94,0.08)' }}>
            {/* Step 2 Header */}
            <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #9F1239 60%, #EC4899 130%)', padding: '2rem 2.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '20%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem', position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '1.25rem' }}>✨</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Langkah 2 dari 2</div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0 }}>Pilih Minat Wisata</h2>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', margin: 0, position: 'relative', maxWidth: '400px' }}>
                Tentukan jenis tempat yang ingin kamu kunjungi — kosongkan untuk semua
              </p>
              {/* Trip summary pill */}
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50px', padding: '6px 14px', position: 'relative' }}>
                <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
                  🗓️ {duration} Hari · 💰 {budget === 0 ? 'Gratis' : `Rp ${budget.toLocaleString('id-ID')}`} · 🎯 {maxDestinations}x/hari
                </span>
              </div>
            </div>

            {/* Category grid */}
            <div style={{ padding: '0 2rem 0', marginTop: '-2rem', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {categories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        padding: '1.25rem 0.75rem',
                        borderRadius: '18px',
                        border: isSelected ? '2px solid transparent' : '2px solid #E5E9F0',
                        background: isSelected
                          ? 'linear-gradient(135deg, #7C3AED, #9F1239)'
                          : 'white',
                        cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                        textAlign: 'center',
                        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                        position: 'relative',
                        boxShadow: isSelected ? '0 6px 20px rgba(124,58,237,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                        transform: isSelected ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.background = '#FAF5FF' } }}
                      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#E5E9F0'; e.currentTarget.style.background = 'white' } }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="white" strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ fontSize: '2.2rem', marginBottom: '8px', filter: isSelected ? 'brightness(1.1)' : 'none' }}>{cat.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? 'white' : '#1A2332', lineHeight: 1.3 }}>{cat.label}</div>
                    </button>
                  )
                })}
              </div>

              {/* Selected summary */}
              <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1rem', borderRadius: '14px', background: selectedCategoryIds.length === 0 ? '#F0FDF4' : '#FAF5FF', border: `1px solid ${selectedCategoryIds.length === 0 ? '#BBF7D0' : '#DDD6FE'}`, fontSize: '0.82rem', fontWeight: 600, color: selectedCategoryIds.length === 0 ? '#065F46' : '#4C1D95', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedCategoryIds.length === 0
                  ? <><span>🌍</span> Semua kategori wisata akan diikutsertakan — semakin beragam semakin seru!</>
                  : <><span>✨</span> {selectedCategoryIds.length} kategori dipilih — itinerary akan disesuaikan dengan minatmu</>}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '1rem', paddingBottom: '2rem' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '1rem', borderRadius: '16px', border: '2px solid #E5E9F0',
                    background: 'white', color: '#4A5568', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A4A5E'; e.currentTarget.style.color = '#0A4A5E' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E9F0'; e.currentTarget.style.color = '#4A5568' }}
                >
                  <ChevronLeft size={18} /> Kembali
                </button>
                <button
                  onClick={generateItinerary}
                  disabled={loading}
                  style={{
                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '1rem', borderRadius: '16px', border: 'none',
                    background: loading ? '#E5E9F0' : 'linear-gradient(135deg, #7C3AED, #9F1239)',
                    color: loading ? '#8B98A9' : 'white', fontWeight: 800, fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.45)' } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)' }}
                >
                  {loading ? (
                    <>
                      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Menyusun Itinerary AI...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Generate Smart Itinerary! ✨
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Smart Customization */}
        {step === 3 && editableItems.length >= 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Customization hint banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
                borderRadius: '16px',
                padding: '1rem 1.5rem',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'fadeInUp 0.4s ease',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: '#FF6B35', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <Sparkles size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#92400E' }}>
                  ✨ Mode Kustomisasi Aktif
                </div>
                <div style={{ fontSize: '0.8rem', color: '#A16207', marginTop: '2px' }}>
                  Sesuaikan itinerary kamu — atur ulang urutan, hapus, atau tambah destinasi baru.
                </div>
              </div>
            </div>

            {/* Live Summary Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)',
                borderRadius: '24px',
                padding: '2rem',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                    <Zap size={18} color="#FF8C5E" />
                    <span style={{ color: '#FF8C5E', fontWeight: 700, fontSize: '0.85rem' }}>ITINERARY SIAP!</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                    Trip Surabaya {duration} Hari
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {liveSummary.areas.length > 0 ? liveSummary.areas.join(' • ') : 'Belum ada destinasi'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.8rem' }}>{liveSummary.destinations}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Destinasi</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.8rem' }}>
                      Rp {(liveSummary.totalCost / 1000).toFixed(0)}K
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Est. Budget</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.8rem' }}>
                      {Math.round(liveSummary.totalTime / 60)}j
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Total Waktu</div>
                  </div>
                </div>
              </div>

              {/* Trip start date picker */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Calendar size={15} />
                    Mulai trip tanggal:
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '10px', padding: '0.5rem 0.75rem', color: 'white',
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600,
                      outline: 'none', cursor: 'pointer',
                    }}
                  />
                  {tripStartDate && (
                    <span style={{ fontSize: '0.78rem', color: '#FF8C5E', fontWeight: 600 }}>
                      {new Date(tripStartDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {duration > 1 && ` — ${new Date(new Date(tripStartDate + 'T00:00:00').getTime() + (duration - 1) * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Day-by-day itinerary with customization */}
            {days.map((day) => {
              const dayItems = editableItems.filter((item) => item.day === day)

              return (
                <div key={day} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E5E9F0' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #F0F7FA, #E8F4F8)',
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid #E5E9F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}
                    >
                      {day}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>Hari ke-{day}</div>
                      <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>
                        {dayItems.length} destinasi
                        {dayItems.length > 0 && ` · ${dayItems.reduce((s, i) => s + i.estimatedVisitTime, 0)} menit`}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dayItems.length === 0 && (
                      <div style={{
                        textAlign: 'center', padding: '2.5rem 1rem', color: '#8B98A9', fontSize: '0.9rem',
                        background: '#FAFCFD', borderRadius: '14px', border: '2px dashed #E5E9F0',
                      }}>
                        <MapPin size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                        <div>Belum ada destinasi di hari ini.</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Klik tombol di bawah untuk menambah.</div>
                      </div>
                    )}

                    {dayItems.map((item, idx) => (
                      <div key={`${item.destination.id}-${day}`} style={{ animation: 'fadeInUp 0.3s ease' }}>
                        {/* Transport note */}
                        {item.transportNote && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#8B98A9',
                              fontStyle: 'italic',
                              marginBottom: '6px',
                              marginLeft: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Bus size={11} style={{ opacity: 0.6 }} /> {item.transportNote}
                          </div>
                        )}

                        {/* Destination card */}
                        <div
                          style={{
                            background: '#F8F6F2',
                            borderRadius: '16px',
                            border: '1px solid #E5E9F0',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                          }}
                        >
                          {/* Card content row */}
                          <div style={{ display: 'flex', gap: '0.85rem', padding: '0.85rem 1rem' }}>
                            {/* Order badge + image */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <div style={{
                                width: '26px', height: '26px', borderRadius: '8px',
                                background: 'linear-gradient(135deg, #FF6B35, #E5522A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 800, fontSize: '0.75rem',
                              }}>
                                {idx + 1}
                              </div>
                              <img
                                src={item.destination.mainImage}
                                alt={item.destination.name}
                                style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                              />
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: '0.68rem', color: 'white', fontWeight: 700,
                                  background: '#0A4A5E', borderRadius: '6px', padding: '2px 7px',
                                }}>
                                  {item.startTime}
                                </span>
                                <span style={{
                                  fontSize: '0.68rem', color: '#4A5568', fontWeight: 600,
                                  background: '#F0F4F8', borderRadius: '6px', padding: '2px 7px',
                                }}>
                                  {item.destination.category.icon} {item.destination.category.name}
                                </span>
                              </div>
                              <Link
                                href={`/wisata/${item.destination.slug}`}
                                style={{ textDecoration: 'none', color: '#1A2332', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3 }}
                              >
                                {item.destination.name}
                              </Link>
                              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '5px', fontSize: '0.75rem', color: '#8B98A9', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={11} /> {item.estimatedVisitTime} mnt
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: item.estimatedCost === 0 ? '#10B981' : '#0A4A5E', fontWeight: 600 }}>
                                  <Wallet size={11} />
                                  {item.estimatedCost === 0 ? 'Gratis' : `Rp ${item.estimatedCost.toLocaleString('id-ID')}`}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <MapPin size={11} /> {item.destination.area}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action toolbar — always visible, clean design */}
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            borderTop: '1px solid #E5E9F0',
                            background: '#FAFCFD',
                          }}>
                            {/* Reorder buttons */}
                            <button
                              onClick={() => idx > 0 && moveItem(day, idx, 'up')}
                              disabled={idx === 0}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                padding: '8px 0', border: 'none', background: 'transparent',
                                color: idx === 0 ? '#D1D5DB' : '#0A4A5E', cursor: idx === 0 ? 'default' : 'pointer',
                                fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                                transition: 'background 0.15s',
                                borderRadius: '0',
                              }}
                              onMouseEnter={(e) => { if (idx > 0) e.currentTarget.style.background = '#F0F7FA' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            >
                              <ChevronUp size={14} /> Naik
                            </button>

                            <div style={{ width: '1px', height: '20px', background: '#E5E9F0' }} />

                            <button
                              onClick={() => idx < dayItems.length - 1 && moveItem(day, idx, 'down')}
                              disabled={idx === dayItems.length - 1}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                padding: '8px 0', border: 'none', background: 'transparent',
                                color: idx === dayItems.length - 1 ? '#D1D5DB' : '#0A4A5E', cursor: idx === dayItems.length - 1 ? 'default' : 'pointer',
                                fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                                transition: 'background 0.15s',
                                borderRadius: '0',
                              }}
                              onMouseEnter={(e) => { if (idx < dayItems.length - 1) e.currentTarget.style.background = '#F0F7FA' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            >
                              <ChevronDown size={14} /> Turun
                            </button>

                            <div style={{ width: '1px', height: '20px', background: '#E5E9F0' }} />

                            <button
                              onClick={() => {
                                const removedItem = { ...item }
                                removeItem(day, idx)
                                setSuggestingFor({ day, slotIdx: idx })
                                fetchSuggestions(removedItem)
                              }}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                padding: '8px 0', border: 'none', background: 'transparent',
                                color: '#EF4444', cursor: 'pointer',
                                fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                                transition: 'background 0.15s',
                                borderRadius: '0',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            >
                              <Trash2 size={13} /> Hapus
                            </button>
                          </div>
                        </div>

                        {/* Suggestion panel (shown after deletion) */}
                        {suggestingFor?.day === day && suggestingFor?.slotIdx === idx && (
                          <div className="suggestion-panel">
                            <div className="suggestion-panel-header">
                              <h4>
                                <Sparkles size={15} color="#FF6B35" />
                                Rekomendasi Pengganti
                              </h4>
                              <button
                                className="suggestion-panel-close"
                                onClick={() => { setSuggestingFor(null); setSuggestions([]) }}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {loadingSuggestions ? (
                              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9' }}>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.5rem' }} />
                                <div style={{ fontSize: '0.85rem' }}>Mencari destinasi serupa...</div>
                              </div>
                            ) : suggestions.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {suggestions.map((s) => (
                                  <div
                                    key={s.id}
                                    className="suggestion-card"
                                    onClick={() => addSuggestionToSlot(s, day)}
                                  >
                                    <img src={s.mainImage} alt={s.name} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332' }}>{s.name}</div>
                                      <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.72rem', color: '#8B98A9', marginTop: '3px', flexWrap: 'wrap' }}>
                                        <span>{s.category.icon} {s.category.name}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          <Star size={10} color="#F59E0B" fill="#F59E0B" /> {s.rating}
                                        </span>
                                        <span style={{ color: s.ticketPrice === 0 ? '#10B981' : '#0A4A5E', fontWeight: 600 }}>
                                          {s.ticketPrice === 0 ? 'Gratis' : `Rp ${s.ticketPrice.toLocaleString('id-ID')}`}
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{
                                      padding: '5px 10px', borderRadius: '8px',
                                      background: '#F0FDF4', border: '1px solid #D1FAE5',
                                      color: '#10B981', fontSize: '0.72rem', fontWeight: 700,
                                      flexShrink: 0, alignSelf: 'center',
                                    }}>
                                      + Pilih
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '1rem', color: '#8B98A9', fontSize: '0.85rem' }}>
                                Tidak ada rekomendasi yang tersedia.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Suggestion panel shown at the end of the day if slot was the last index */}
                    {suggestingFor?.day === day && suggestingFor?.slotIdx >= dayItems.length && (
                      <div className="suggestion-panel">
                        <div className="suggestion-panel-header">
                          <h4>
                            <Sparkles size={15} color="#FF6B35" />
                            Rekomendasi Pengganti
                          </h4>
                          <button
                            className="suggestion-panel-close"
                            onClick={() => { setSuggestingFor(null); setSuggestions([]) }}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {loadingSuggestions ? (
                          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9' }}>
                            <Loader size={20} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.5rem' }} />
                            <div style={{ fontSize: '0.85rem' }}>Mencari destinasi serupa...</div>
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {suggestions.map((s) => (
                              <div
                                key={s.id}
                                className="suggestion-card"
                                onClick={() => addSuggestionToSlot(s, day)}
                              >
                                <img src={s.mainImage} alt={s.name} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332' }}>{s.name}</div>
                                  <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.72rem', color: '#8B98A9', marginTop: '3px', flexWrap: 'wrap' }}>
                                    <span>{s.category.icon} {s.category.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <Star size={10} color="#F59E0B" fill="#F59E0B" /> {s.rating}
                                    </span>
                                    <span style={{ color: s.ticketPrice === 0 ? '#10B981' : '#0A4A5E', fontWeight: 600 }}>
                                      {s.ticketPrice === 0 ? 'Gratis' : `Rp ${s.ticketPrice.toLocaleString('id-ID')}`}
                                    </span>
                                  </div>
                                </div>
                                <div style={{
                                  padding: '5px 10px', borderRadius: '8px',
                                  background: '#F0FDF4', border: '1px solid #D1FAE5',
                                  color: '#10B981', fontSize: '0.72rem', fontWeight: 700,
                                  flexShrink: 0, alignSelf: 'center',
                                }}>
                                  + Pilih
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '1rem', color: '#8B98A9', fontSize: '0.85rem' }}>
                            Tidak ada rekomendasi yang tersedia.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add destination section */}
                    {addingForDay === day ? (
                      <div style={{
                        background: 'white', border: '1px solid #E5E9F0', borderRadius: '16px',
                        overflow: 'hidden', animation: 'slideDown 0.3s ease',
                        boxShadow: '0 4px 20px rgba(10,74,94,0.06)',
                      }}>
                        {/* Panel header */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.85rem 1.15rem',
                          background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
                          borderBottom: '1px solid #D1FAE5',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '8px',
                              background: '#10B981', display: 'flex', alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Plus size={14} color="white" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#065F46' }}>
                                Tambah Destinasi
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#059669' }}>
                                Hari {day} · Pilih dari rekomendasi atau cari manual
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => { setAddingForDay(null); setAddCandidates([]); setAddSearch('') }}
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              border: 'none', background: 'rgba(5,150,105,0.1)', color: '#059669',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(5,150,105,0.1)'; e.currentTarget.style.color = '#059669' }}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div style={{ padding: '1rem 1.15rem' }}>
                          {/* Recommendations section (shown first) */}
                          {loadingAddCandidates ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#8B98A9' }}>
                              <Loader size={22} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
                              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Mencari rekomendasi terbaik...</div>
                            </div>
                          ) : (
                            <>
                              {/* Recommended destinations header */}
                              {!addSearch && filteredAddCandidates.length > 0 && (
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  marginBottom: '0.65rem',
                                  fontSize: '0.8rem', fontWeight: 700, color: '#0A4A5E',
                                }}>
                                  <Sparkles size={13} />
                                  Rekomendasi untuk kamu
                                </div>
                              )}

                              {/* Destination list */}
                              {filteredAddCandidates.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                                  {filteredAddCandidates.map((d) => (
                                    <div
                                      key={d.id}
                                      onClick={() => addDestination(d, day)}
                                      style={{
                                        display: 'flex', gap: '0.65rem', padding: '0.6rem 0.75rem',
                                        borderRadius: '12px', border: '1.5px solid #E5E9F0',
                                        cursor: 'pointer', transition: 'all 0.2s ease', background: 'white',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#10B981'
                                        e.currentTarget.style.background = '#F0FDF4'
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(16,185,129,0.1)'
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E9F0'
                                        e.currentTarget.style.background = 'white'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'none'
                                      }}
                                    >
                                      <img
                                        src={d.mainImage} alt={d.name}
                                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1A2332' }}>{d.name}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#8B98A9', marginTop: '2px', flexWrap: 'wrap' }}>
                                          <span>{d.category.icon} {d.category.name}</span>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Star size={9} color="#F59E0B" fill="#F59E0B" /> {d.rating}
                                          </span>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <MapPin size={9} /> {d.area}
                                          </span>
                                          <span style={{ color: d.ticketPrice === 0 ? '#10B981' : '#0A4A5E', fontWeight: 600 }}>
                                            {d.ticketPrice === 0 ? 'Gratis' : `Rp ${d.ticketPrice.toLocaleString('id-ID')}`}
                                          </span>
                                        </div>
                                      </div>
                                      <div style={{
                                        padding: '4px 9px', borderRadius: '8px',
                                        background: '#F0FDF4', border: '1px solid #D1FAE5',
                                        color: '#10B981', fontSize: '0.7rem', fontWeight: 700,
                                        flexShrink: 0, alignSelf: 'center', whiteSpace: 'nowrap',
                                      }}>
                                        + Tambah
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                !addSearch && (
                                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B98A9', fontSize: '0.85rem' }}>
                                    Tidak ada destinasi tersedia.
                                  </div>
                                )
                              )}

                              {/* Search section (below recommendations) */}
                              <div style={{
                                borderTop: filteredAddCandidates.length > 0 && !addSearch ? '1px solid #E5E9F0' : 'none',
                                paddingTop: filteredAddCandidates.length > 0 && !addSearch ? '0.75rem' : '0',
                              }}>
                                <div style={{ position: 'relative' }}>
                                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8B98A9' }} />
                                  <input
                                    className="search-destinations-input"
                                    type="text"
                                    placeholder="Cari destinasi lain..."
                                    value={addSearch}
                                    onChange={(e) => setAddSearch(e.target.value)}
                                  />
                                </div>
                                {addSearch && filteredAddCandidates.length === 0 && (
                                  <div style={{ textAlign: 'center', padding: '1rem', color: '#8B98A9', fontSize: '0.82rem' }}>
                                    Tidak ditemukan hasil untuk &quot;{addSearch}&quot;
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        className="add-destination-btn"
                        onClick={() => {
                          setAddingForDay(day)
                          fetchAddCandidates(day)
                        }}
                      >
                        <Plus size={15} />
                        Tambah Destinasi
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Budget breakdown */}
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #E5E9F0',
              }}
            >
              <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '1.25rem' }}>💰 Estimasi Biaya Perjalanan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#4A5568' }}>Tiket Masuk ({liveSummary.destinations} destinasi)</span>
                  <strong style={{ color: '#1A2332' }}>Rp {liveSummary.totalCost.toLocaleString('id-ID')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#4A5568' }}>Transportasi (estimasi)</span>
                  <strong style={{ color: '#1A2332' }}>Rp {(liveSummary.destinations * 25000).toLocaleString('id-ID')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#4A5568' }}>Makan & minuman (estimasi)</span>
                  <strong style={{ color: '#1A2332' }}>Rp {(duration * 50000).toLocaleString('id-ID')}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderTop: '2px solid #0A4A5E',
                    marginTop: '0.25rem',
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#1A2332', fontSize: '1rem' }}>Total Estimasi</span>
                  <strong style={{ color: '#0A4A5E', fontSize: '1.1rem' }}>
                    Rp {liveSummary.grandTotal.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setStep(1); setGenerated(null); setEditableItems([]) }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <ChevronLeft size={18} /> Buat Ulang
              </button>

              {savedId ? (
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#DCFCE7',
                      borderRadius: '50px',
                      padding: '0.75rem 1.75rem',
                      color: '#15803D',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    <Check size={18} /> Itinerary Tersimpan!
                  </div>
                  {paidEditableItems.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedBookingIds(paidEditableItems.map((i) => i.destination.id))
                        setShowBookingModal(true)
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '0.6rem 1rem', borderRadius: '50px',
                        background: 'linear-gradient(135deg, #FF6B35, #E5522A)', color: 'white',
                        border: 'none', fontWeight: 700, fontSize: '0.85rem',
                        cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Ticket size={15} /> Pesan {paidEditableItems.length} Tiket Sekaligus
                    </button>
                  )}
                  <Link
                    href={`/itinerary/${savedId}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontSize: '0.8rem', color: '#0A4A5E', textDecoration: 'none', fontWeight: 600,
                      padding: '0.4rem',
                    }}
                  >
                    Lihat Detail Itinerary <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={saveItinerary}
                  disabled={saving || editableItems.length === 0}
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', opacity: saving || editableItems.length === 0 ? 0.6 : 1 }}
                >
                  {saving ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                  {saving ? 'Menyimpan...' : 'Simpan Itinerary'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '520px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 0.3s ease',
          }}>
            {/* Modal header */}
            <div style={{
              background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)',
              padding: '1.5rem', borderRadius: '24px 24px 0 0', color: 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                    <Ticket size={16} color="#FF8C5E" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF8C5E', letterSpacing: '0.05em' }}>PESAN TIKET</span>
                  </div>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>Booking Tiket Destinasi</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    Pesan tiket untuk {paidEditableItems.length} destinasi berbayar dalam itinerary kamu
                  </p>
                </div>
                <button
                  onClick={() => { setShowBookingModal(false); setBookingError('') }}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {/* Trip date reminder */}
              {tripStartDate ? (
                <div style={{
                  background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '12px',
                  padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Calendar size={15} color="#10B981" />
                  <span style={{ fontSize: '0.82rem', color: '#065F46', fontWeight: 600 }}>
                    Trip dimulai: {new Date(tripStartDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              ) : (
                <div style={{
                  background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px',
                  padding: '0.75rem 1rem', marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#92400E', fontWeight: 600, marginBottom: '6px' }}>
                    ⚠️ Pilih tanggal mulai trip dulu
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.88rem' }}
                  />
                </div>
              )}

              {/* Destination selection */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.6rem' }}>
                  Destinasi Berbayar ({selectedBookingIds.length}/{paidEditableItems.length} dipilih)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {paidEditableItems.map((item) => {
                    const isSelected = selectedBookingIds.includes(item.destination.id)
                    const visitDate = getVisitDate(item.day)
                    return (
                      <div
                        key={item.destination.id}
                        onClick={() => {
                          setSelectedBookingIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== item.destination.id)
                              : [...prev, item.destination.id]
                          )
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.65rem 0.85rem', borderRadius: '12px',
                          border: `2px solid ${isSelected ? '#0A4A5E' : '#E5E9F0'}`,
                          background: isSelected ? '#F0F7FA' : 'white',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '6px',
                          border: `2px solid ${isSelected ? '#0A4A5E' : '#CBD5E0'}`,
                          background: isSelected ? '#0A4A5E' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 0.15s',
                        }}>
                          {isSelected && <Check size={13} color="white" strokeWidth={3} />}
                        </div>

                        <img
                          src={item.destination.mainImage}
                          alt={item.destination.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1A2332' }}>{item.destination.name}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#8B98A9', marginTop: '2px' }}>
                            <span>Hari {item.day}</span>
                            {visitDate && <span>· {new Date(visitDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                            <span>· {item.startTime}</span>
                          </div>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0A4A5E', flexShrink: 0 }}>
                          Rp {item.estimatedCost.toLocaleString('id-ID')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Ticket count */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem' }}>Jumlah Tiket (per destinasi)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setBookingTicketCount(Math.max(1, bookingTicketCount - 1))}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #E5E9F0', background: 'white', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4A5568', fontFamily: 'Outfit, sans-serif' }}
                  >−</button>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2332', minWidth: '24px', textAlign: 'center' }}>{bookingTicketCount}</span>
                  <button
                    onClick={() => setBookingTicketCount(Math.min(10, bookingTicketCount + 1))}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #0A4A5E', background: '#0A4A5E', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}
                  >+</button>
                  <span style={{ fontSize: '0.78rem', color: '#8B98A9' }}>orang</span>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A2332', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} /> Metode Pembayaran
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setBookingPayment(m.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                        padding: '0.6rem 0.5rem', borderRadius: '12px',
                        border: `2px solid ${bookingPayment === m.id ? '#0A4A5E' : '#E5E9F0'}`,
                        background: bookingPayment === m.id ? '#F0F7FA' : 'white',
                        cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: bookingPayment === m.id ? '#0A4A5E' : '#4A5568' }}>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {bookingError && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '0.6rem 0.85rem', color: '#B91C1C', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                  ⚠️ {bookingError}
                </div>
              )}

              {/* Total + Actions */}
              <div style={{
                background: '#F8FAFC', borderRadius: '14px', padding: '1rem',
                border: '1px solid #E5E9F0', marginBottom: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#4A5568' }}>{selectedBookingIds.length} destinasi × {bookingTicketCount} orang</span>
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0A4A5E' }}>Rp {selectedBookingTotal.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#8B98A9' }}>
                  <Shield size={12} color="#10B981" />
                  Transaksi dilindungi enkripsi SSL
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => { setShowBookingModal(false); setBookingError('') }}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem' }}
                >
                  Nanti Saja
                </button>
                <button
                  onClick={handleBulkBooking}
                  disabled={bookingLoading || selectedBookingIds.length === 0}
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontSize: '0.88rem', opacity: bookingLoading || selectedBookingIds.length === 0 ? 0.6 : 1 }}
                >
                  {bookingLoading ? (
                    <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
                  ) : (
                    <><Ticket size={16} /> Pesan {selectedBookingIds.length} Tiket</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: '#8B98A9' }}>Memuat itinerary...</div>}>
      <ItineraryContent />
    </Suspense>
  )
}
