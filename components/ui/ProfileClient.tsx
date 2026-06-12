'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QRModal } from '@/components/ui/QRModal'
import LogoutButton from '@/components/ui/LogoutButton'
import {
  BookOpen, Ticket, Star, MapPin, Calendar, Wallet, ArrowRight,
  TrendingUp, Award, Clock, User, Mail, ChevronRight, QrCode, ExternalLink,
  Map, Heart, Zap, Shield, Trash2, HelpCircle, X, Check
} from 'lucide-react'

/* ── types ── */
interface ItineraryItem { id: number; destinationName: string; categoryIcon: string; categoryColor: string; mainImage: string }
interface Itinerary { id: number; title: string; duration: number; area: string; totalEstimatedCost: number; startDate: string | null; createdAt: string; isCanvas: boolean; itemCount: number; items: ItineraryItem[] }
interface Booking { id: number; bookingCode: string; status: string; visitDate: string; ticketCount: number; totalPrice: number; createdAt: string; destination: { name: string; mainImage: string; slug: string; area: string; categoryName: string; categoryIcon: string; categoryColor: string } }
interface Review { id: number; rating: number; comment: string; createdAt: string; destination: { name: string; slug: string; mainImage: string } }
interface Stats { itineraryCount: number; bookingCount: number; reviewCount: number; totalSpent: number; confirmedBookings: number; avgRating: string | null; uniqueAreas: number; totalDays: number }
interface UserData { name: string; email: string; role: string; avatar: string | null; createdAt: string }

interface Props {
  data: {
    user: UserData
    stats: Stats
    itineraries: Itinerary[]
    bookings: Booking[]
    reviews: Review[]
    savedEvents: Array<{
      id: number
      savedAt: string
      event: { id: number, title: string, slug: string, image: string, category: string, startDate: string, endDate: string, location: string }
    }>
  }
}

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  confirmed: { bg: '#ECFDF5', text: '#065F46', label: '✓ Terkonfirmasi', dot: '#10B981' },
  pending:   { bg: '#FFFBEB', text: '#92400E', label: '⏳ Menunggu', dot: '#F59E0B' },
  cancelled: { bg: '#FEF2F2', text: '#991B1B', label: '✕ Dibatalkan', dot: '#EF4444' },
}

/* ── Animated counter ── */
function StatCard({ value, label, icon, color, prefix = '', suffix = '' }: { value: number | string; label: string; icon: React.ReactNode; color: string; prefix?: string; suffix?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
      borderRadius: '18px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', flexDirection: 'column', gap: '6px',
      transition: 'transform 0.2s, background 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color, background: color + '22', padding: '6px', borderRadius: '10px' }}>{icon}</div>
      </div>
      <div style={{ fontWeight: 900, fontSize: '1.6rem', color: 'white', lineHeight: 1 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('id-ID') : value}{suffix}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

/* ── Achievement badge ── */
function AchievementBadge({ icon, label, desc, unlocked }: { icon: string; label: string; desc: string; unlocked: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px', borderRadius: '14px',
      background: unlocked ? 'linear-gradient(135deg, #FFF7ED, #FED7AA)' : '#F8F6F2',
      border: `1.5px solid ${unlocked ? '#FDBA74' : '#E5E9F0'}`,
      opacity: unlocked ? 1 : 0.5,
      transition: 'all 0.2s',
    }}>
      <div style={{ fontSize: '1.5rem', filter: unlocked ? 'none' : 'grayscale(1)' }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: unlocked ? '#92400E' : '#8B98A9' }}>{label}</div>
        <div style={{ fontSize: '0.7rem', color: '#8B98A9' }}>{desc}</div>
      </div>
      {unlocked && <div style={{ marginLeft: 'auto', color: '#F59E0B', fontSize: '0.65rem', fontWeight: 800, background: '#FEF3C7', padding: '2px 7px', borderRadius: '50px' }}>UNLOCKED</div>}
    </div>
  )
}

const TABS = [
  { id: 'overview', label: '📊 Overview', icon: TrendingUp },
  { id: 'missions', label: '🏅 Misi & Medali', icon: Award },
  { id: 'itinerary', label: '🗺️ Itinerary', icon: BookOpen },
  { id: 'booking', label: '🎟️ Booking', icon: Ticket },
  { id: 'review', label: '⭐ Review', icon: Star },
  { id: 'events', label: '📅 Event Tersimpan', icon: Calendar },
]

export default function ProfileClient({ data }: Props) {
  const { user: initialUser, stats, itineraries: initialItineraries, bookings, reviews, savedEvents } = data
  const [user, setUser] = useState(initialUser)
  const [itineraries, setItineraries] = useState(initialItineraries)
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'overview')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editAvatar, setEditAvatar] = useState(user.avatar || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  
  // Gamification state
  const [showPointsInfo, setShowPointsInfo] = useState(false)

  const AVATARS = ['🦊', '🐼', '🦁', '🐻', '🐰', '🐸', '🦄', '🐧', '👨‍🚀', '👩‍🚀', '🕵️‍♂️', '🕵️‍♀️', '🧙‍♂️', '🥷']

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateError('')

    try {
      const res = await fetch('/api/profil/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          avatar: editAvatar,
          currentPassword,
          newPassword
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      const data = await res.json()
      setUser({ ...user, name: data.user.name, avatar: data.user.avatar })
      setIsEditModalOpen(false)
      setCurrentPassword('')
      newPassword && setNewPassword('')
    } catch (err: any) {
      setUpdateError(err.message || 'Gagal menyimpan profil')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCanvas = async (id: number) => {
    try {
      const res = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus kanvas')
      setItineraries(prev => prev.filter(i => i.id !== id))
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan saat menghapus kanvas')
    }
  }

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const initial = user.name.charAt(0).toUpperCase()
  const memberSince = new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  // --- GAMIFICATION & QUEST LOGIC ---
  const confirmedBookingsList = bookings.filter(b => b.status === 'confirmed')
  const culinaryBookings = confirmedBookingsList.filter(b => b.destination.categoryName.toLowerCase().includes('kuliner')).length
  const historyBookings = confirmedBookingsList.filter(b => b.destination.categoryName.toLowerCase().includes('sejarah') || b.destination.categoryName.toLowerCase().includes('budaya')).length
  const natureBookings = confirmedBookingsList.filter(b => b.destination.categoryName.toLowerCase().includes('alam') || b.destination.categoryName.toLowerCase().includes('taman')).length
  const entertainmentBookings = confirmedBookingsList.filter(b => b.destination.categoryName.toLowerCase().includes('hiburan') || b.destination.categoryName.toLowerCase().includes('rekreasi')).length
  const shoppingBookings = confirmedBookingsList.filter(b => b.destination.categoryName.toLowerCase().includes('oleh-oleh') || b.destination.categoryName.toLowerCase().includes('belanja')).length

  const questList = [
    { id: 1, title: 'Turis Pemula', desc: 'Booking 1 tiket', goal: 1, progress: confirmedBookingsList.length, pts: 50, medal: '🎟️' },
    { id: 2, title: 'Turis Konsisten', desc: 'Booking 3 tiket', goal: 3, progress: confirmedBookingsList.length, pts: 150, medal: '🎫' },
    { id: 3, title: 'Turis Setia', desc: 'Booking 5 tiket', goal: 5, progress: confirmedBookingsList.length, pts: 300, medal: '🪪' },
    { id: 4, title: 'Turis Fanatik', desc: 'Booking 10 tiket', goal: 10, progress: confirmedBookingsList.length, pts: 500, medal: '🎗️' },
    { id: 5, title: 'Sang Kolektor', desc: 'Booking 20 tiket', goal: 20, progress: confirmedBookingsList.length, pts: 1000, medal: '🎖️' },
    { id: 6, title: 'Tamu Kehormatan', desc: 'Booking 30 tiket', goal: 30, progress: confirmedBookingsList.length, pts: 1500, medal: '🏆' },
    { id: 7, title: 'Pencinta Kuliner', desc: 'Booking 1 Kuliner', goal: 1, progress: culinaryBookings, pts: 100, medal: '🍜' },
    { id: 8, title: 'Raja Kuliner', desc: 'Booking 5 Kuliner', goal: 5, progress: culinaryBookings, pts: 300, medal: '🍱' },
    { id: 9, title: 'Sang Sejarawan', desc: 'Booking 1 Sejarah', goal: 1, progress: historyBookings, pts: 100, medal: '🏛️' },
    { id: 10, title: 'Penjaga Budaya', desc: 'Booking 5 Sejarah', goal: 5, progress: historyBookings, pts: 300, medal: '🏺' },
    { id: 11, title: 'Anak Alam', desc: 'Booking 1 Alam', goal: 1, progress: natureBookings, pts: 100, medal: '🌳' },
    { id: 12, title: 'Penjelajah Rimba', desc: 'Booking 5 Alam', goal: 5, progress: natureBookings, pts: 300, medal: '🏕️' },
    { id: 13, title: 'Pemburu Hiburan', desc: 'Booking 1 Hiburan', goal: 1, progress: entertainmentBookings, pts: 100, medal: '🎢' },
    { id: 14, title: 'Raja Pesta', desc: 'Booking 5 Hiburan', goal: 5, progress: entertainmentBookings, pts: 300, medal: '🎡' },
    { id: 15, title: 'Penggila Belanja', desc: 'Booking 3 Oleh-oleh', goal: 3, progress: shoppingBookings, pts: 200, medal: '🛍️' },
    { id: 16, title: 'Kritikus Pemula', desc: 'Tulis 1 Ulasan', goal: 1, progress: stats.reviewCount, pts: 50, medal: '✍️' },
    { id: 17, title: 'Kritikus Handal', desc: 'Tulis 5 Ulasan', goal: 5, progress: stats.reviewCount, pts: 250, medal: '📝' },
    { id: 18, title: 'Suara Masyarakat', desc: 'Tulis 15 Ulasan', goal: 15, progress: stats.reviewCount, pts: 600, medal: '🗣️' },
    { id: 19, title: 'Opini Emas', desc: 'Tulis 30 Ulasan', goal: 30, progress: stats.reviewCount, pts: 1000, medal: '🌟' },
    { id: 20, title: 'Hakim MlaKoow', desc: 'Tulis 50 Ulasan', goal: 50, progress: stats.reviewCount, pts: 2000, medal: '⚖️' },
    { id: 21, title: 'Perencana Coba-coba', desc: 'Buat 1 Itinerary', goal: 1, progress: stats.itineraryCount, pts: 100, medal: '🗺️' },
    { id: 22, title: 'Arsitek Liburan', desc: 'Buat 5 Itinerary', goal: 5, progress: stats.itineraryCount, pts: 300, medal: '🏗️' },
    { id: 23, title: 'Master Planner', desc: 'Buat 15 Itinerary', goal: 15, progress: stats.itineraryCount, pts: 750, medal: '🧭' },
    { id: 24, title: 'Dewa Perencana', desc: 'Buat 30 Itinerary', goal: 30, progress: stats.itineraryCount, pts: 1500, medal: '🔮' },
    { id: 25, title: 'Penjelajah Beragam', desc: 'Kunjungi 3 Area', goal: 3, progress: stats.uniqueAreas, pts: 300, medal: '📍' },
    { id: 26, title: 'Penguasa Wilayah', desc: 'Kunjungi 5 Area', goal: 5, progress: stats.uniqueAreas, pts: 500, medal: '🗺️' },
    { id: 27, title: 'Pengumpul Memori', desc: 'Simpan 5 Event', goal: 5, progress: savedEvents.length, pts: 200, medal: '📸' },
    { id: 28, title: 'Warga Aktif', desc: 'Simpan 15 Event', goal: 15, progress: savedEvents.length, pts: 500, medal: '🎟️' },
    { id: 29, title: 'Sultan MlaKoow', desc: 'Transaksi Rp 1.000.000', goal: 1000000, progress: stats.totalSpent, pts: 500, medal: '💎' },
    { id: 30, title: 'Crazy Rich Surabaya', desc: 'Transaksi Rp 5.000.000', goal: 5000000, progress: stats.totalSpent, pts: 1500, medal: '👑' },
  ]
  const questBonusPoints = questList.filter(q => q.progress >= q.goal).reduce((acc, q) => acc + q.pts, 0)

  let totalPoints = (stats.itineraryCount * 150) + (stats.confirmedBookings * 500) + (stats.reviewCount * 250) + (savedEvents.length * 50) + questBonusPoints
  
  if (user.role === 'admin') {
    totalPoints = Math.max(totalPoints, 99999)
  }
  
  const LEVELS = [
    { level: 1, name: 'Turis Amatir', min: 0, max: 499, icon: '🐣', color: '#9CA3AF', bg: 'linear-gradient(135deg, #F3F4F6, #D1D5DB)', glow: 'rgba(156,163,175,0.4)' },
    { level: 2, name: 'Traveler Pemula', min: 500, max: 1499, icon: '🌱', color: '#10B981', bg: 'linear-gradient(135deg, #A7F3D0, #34D399)', glow: 'rgba(16,185,129,0.4)' },
    { level: 3, name: 'Pejalan Santai', min: 1500, max: 2999, icon: '🚶‍♂️', color: '#3B82F6', bg: 'linear-gradient(135deg, #BFDBFE, #60A5FA)', glow: 'rgba(59,130,246,0.4)' },
    { level: 4, name: 'Penjelajah Kota', min: 3000, max: 4999, icon: '🏙️', color: '#8B5CF6', bg: 'linear-gradient(135deg, #DDD6FE, #A78BFA)', glow: 'rgba(139,92,246,0.4)' },
    { level: 5, name: 'Pencari Jejak', min: 5000, max: 7499, icon: '🧭', color: '#F59E0B', bg: 'linear-gradient(135deg, #FDE68A, #FBBF24)', glow: 'rgba(245,158,11,0.4)' },
    { level: 6, name: 'Petualang Aktif', min: 7500, max: 10999, icon: '🏃‍♂️', color: '#EC4899', bg: 'linear-gradient(135deg, #FBCFE8, #F472B6)', glow: 'rgba(236,72,153,0.4)' },
    { level: 7, name: 'Pakar Rute', min: 11000, max: 14999, icon: '🗺️', color: '#14B8A6', bg: 'linear-gradient(135deg, #99F6E4, #2DD4BF)', glow: 'rgba(20,184,166,0.4)' },
    { level: 8, name: 'Sang Navigator', min: 15000, max: 19999, icon: '🚤', color: '#6366F1', bg: 'linear-gradient(135deg, #C7D2FE, #818CF8)', glow: 'rgba(99,102,241,0.4)' },
    { level: 9, name: 'Suhu Pariwisata', min: 20000, max: 29999, icon: '👑', color: '#F43F5E', bg: 'linear-gradient(135deg, #FECDD3, #FB7185)', glow: 'rgba(244,63,94,0.4)' },
    { level: 10, name: 'Legenda MlaKoow', min: 30000, max: Infinity, icon: '🌟', color: '#EF4444', bg: 'linear-gradient(135deg, #FFD700, #FF4500)', glow: 'rgba(255,69,0,0.6)' },
  ]

  let currentLevelIndex = LEVELS.findIndex(l => totalPoints >= l.min && totalPoints <= l.max)
  if(currentLevelIndex === -1) currentLevelIndex = LEVELS.length - 1 // Fallback max level
  const currentLevel = LEVELS[currentLevelIndex]
  const nextLevel = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1] : null
  
  const progressPercent = nextLevel 
    ? ((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 
    : 100

  const achievements = [
    { icon: '🌟', label: 'Petualang Pertama', desc: 'Buat itinerary pertama', unlocked: stats.itineraryCount >= 1 },
    { icon: '🎟️', label: 'Traveler Aktif', desc: 'Booking 1 tiket', unlocked: stats.confirmedBookings >= 1 },
    { icon: '🗺️', label: 'Multi-Area Explorer', desc: 'Kunjungi 2+ area', unlocked: stats.uniqueAreas >= 2 },
    { icon: '✍️', label: 'Reviewer Andal', desc: 'Tulis 3 review', unlocked: stats.reviewCount >= 3 },
    { icon: '📅', label: 'Planner Pro', desc: 'Trip 5+ hari total', unlocked: stats.totalDays >= 5 },
    { icon: '💰', label: 'Big Spender', desc: 'Total belanja Rp 500rb+', unlocked: stats.totalSpent >= 500000 },
  ]

  const renderItineraryCard = (itin: Itinerary) => (
    <Link key={itin.id} href={itin.isCanvas ? `/itinerary/kanvas/${itin.id}` : `/itinerary/${itin.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0',
        overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(10,74,94,0.05)',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(10,74,94,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(10,74,94,0.05)' }}
      >
        <div style={{ display: 'flex', height: '80px', overflow: 'hidden' }}>
          {itin.items.slice(0, 3).map((item, i) => (
            <div key={i} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <img src={item.mainImage} alt={item.destinationName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
            </div>
          ))}
          {itin.items.length === 0 && (
            <div style={{ flex: 1, background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🗺️</div>
          )}
        </div>

        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', lineHeight: 1.3 }}>{itin.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {itin.isCanvas && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if(confirm('Hapus kanvas ini?')) {
                      handleDeleteCanvas(itin.id)
                    }
                  }}
                  style={{
                    background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '8px',
                    padding: '6px', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Hapus Kanvas"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <ArrowRight size={15} color="#8B98A9" style={{ flexShrink: 0 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: '#8B98A9', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} /> {itin.duration} hari</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {itin.area}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Wallet size={11} /> Rp {itin.totalEstimatedCost.toLocaleString('id-ID')}</span>
          </div>

          {itin.startDate && (
            <div style={{ fontSize: '0.75rem', color: '#0A4A5E', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🗓️ Trip: {new Date(itin.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {itin.items.map(item => (
              <span key={item.id} style={{
                padding: '2px 8px', borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700,
                background: item.categoryColor + '15', color: item.categoryColor, border: `1px solid ${item.categoryColor}30`,
              }}>
                {item.categoryIcon} {item.destinationName}
              </span>
            ))}
            {itin.itemCount > 4 && (
              <span style={{ padding: '2px 8px', borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700, background: '#F0F4F8', color: '#8B98A9' }}>
                +{itin.itemCount - 4} lainnya
              </span>
            )}
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#8B98A9' }}>
            Dibuat {new Date(itin.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div style={{ flex: 1 }}>
      {/* ── HERO BANNER ── */}
      <div style={{ background: 'linear-gradient(135deg, #041E28 0%, #0A4A5E 60%, #0D6E84 100%)', padding: '2.5rem 1.5rem 0', color: 'white', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(13,110,132,0.25)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,107,53,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Profile header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #0D6E84 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', fontWeight: 900, color: 'white',
                border: '4px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}>
                {user.avatar ? user.avatar : initial}
              </div>
              {/* Online indicator */}
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '18px', height: '18px', borderRadius: '50%', background: '#10B981', border: '3px solid #0A4A5E' }} />
            </div>

            {/* Name & info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, margin: 0 }}>{user.name}</h1>
                <span style={{
                  padding: '3px 10px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800,
                  background: user.role === 'admin' ? 'rgba(255,107,53,0.25)' : 'rgba(16,185,129,0.2)',
                  color: user.role === 'admin' ? '#FF8C5E' : '#6EE7B7',
                  border: `1px solid ${user.role === 'admin' ? 'rgba(255,107,53,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  letterSpacing: '0.05em',
                }}>
                  {user.role === 'admin' ? '👑 ADMIN' : '🌟 MEMBER'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={13} /> {user.email}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> Member sejak {memberSince}</span>
                {stats.uniqueAreas > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} /> {stats.uniqueAreas} area dijelajahi</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.25rem', fontSize: '0.85rem',
                  boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
                  background: '#FF6B35', border: 'none', color: 'white', borderRadius: '50px', fontWeight: 800, cursor: 'pointer'
                }}>
                Edit Profil
              </button>
              <LogoutButton />
            </div>
          </div>

          {/* ── GAMIFICATION WIDGET ── */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px', background: currentLevel.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                  boxShadow: `0 8px 24px ${currentLevel.glow}`, border: '2px solid rgba(255,255,255,0.8)'
                }}>
                  {currentLevel.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Level {currentLevel.level}</div>
                    <button onClick={() => setShowPointsInfo(true)} style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <HelpCircle size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                    {currentLevel.name}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38BDF8', lineHeight: 1 }}>
                  {totalPoints.toLocaleString('id-ID')} <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>pts</span>
                </div>
                {nextLevel && (
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    Butuh {(nextLevel.min - totalPoints).toLocaleString('id-ID')} pts ke Level {nextLevel.level}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ position: 'relative', width: '100%', height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '50px', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%',
                background: currentLevel.bg, width: `${progressPercent}%`,
                transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: `0 0 10px ${currentLevel.glow}`
              }} />
            </div>
            
            {/* Markers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontWeight: 600 }}>
              <span>{currentLevel.min.toLocaleString('id-ID')}</span>
              <span>{nextLevel ? nextLevel.min.toLocaleString('id-ID') : 'Maks'}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
            <StatCard value={stats.itineraryCount} label="Total Itinerary" icon={<BookOpen size={16} />} color="#60A5FA" />
            <StatCard value={stats.confirmedBookings} label="Tiket Terkonfirmasi" icon={<Ticket size={16} />} color="#34D399" />
            <StatCard value={stats.reviewCount} label="Review Ditulis" icon={<Star size={16} />} color="#FBBF24" />
            <StatCard value={stats.totalDays} label="Total Hari Trip" icon={<Calendar size={16} />} color="#A78BFA" />
            <StatCard value={stats.totalSpent} label="Total Pengeluaran" icon={<Wallet size={16} />} color="#FB923C" prefix="Rp " />
            {stats.avgRating && <StatCard value={stats.avgRating} label="Avg Rating Diberikan" icon={<Star size={16} />} color="#F472B6" suffix=" ★" />}
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                  color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.55)',
                  fontWeight: activeTab === tab.id ? 800 : 600, fontSize: '0.85rem',
                  fontFamily: 'Outfit, sans-serif',
                  borderBottom: activeTab === tab.id ? '3px solid #FF6B35' : '3px solid transparent',
                  transition: 'all 0.18s', whiteSpace: 'nowrap',
                  paddingBottom: activeTab === tab.id ? 'calc(0.75rem - 0px)' : '0.75rem',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Recent Activity */}
            <div style={{ gridColumn: 'span 2', background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', boxShadow: '0 4px 20px rgba(10,74,94,0.05)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#F59E0B" /> Aktivitas Terbaru
              </h2>
              {[...itineraries.slice(0, 2).map(i => ({ type: 'itinerary' as const, date: i.createdAt, data: i })),
                ...bookings.slice(0, 2).map(b => ({ type: 'booking' as const, date: b.createdAt, data: b })),
                ...reviews.slice(0, 2).map(r => ({ type: 'review' as const, date: r.createdAt, data: r })),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: idx < 4 ? '1px solid #F0F4F8' : 'none' }}>
                  {/* Timeline dot */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                      background: item.type === 'itinerary' ? '#EFF6FF' : item.type === 'booking' ? '#F0FDF4' : '#FFFBEB',
                      border: `2px solid ${item.type === 'itinerary' ? '#BFDBFE' : item.type === 'booking' ? '#BBF7D0' : '#FDE68A'}`,
                    }}>
                      {item.type === 'itinerary' ? '🗺️' : item.type === 'booking' ? '🎟️' : '⭐'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {item.type === 'itinerary' && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>{(item.data as Itinerary).title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#8B98A9', marginTop: '2px' }}>
                          Itinerary dibuat • {(item.data as Itinerary).duration} hari • {(item.data as Itinerary).itemCount} destinasi
                        </div>
                      </>
                    )}
                    {item.type === 'booking' && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>Booking: {(item.data as Booking).destination.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#8B98A9', marginTop: '2px' }}>
                          {(item.data as Booking).ticketCount} tiket
                          {(item.data as Booking).totalPrice > 0 && ` • Rp ${(item.data as Booking).totalPrice.toLocaleString('id-ID')}`}
                          {' • '}<span style={{ color: STATUS_COLOR[(item.data as Booking).status]?.text ?? '#8B98A9', fontWeight: 600 }}>{STATUS_COLOR[(item.data as Booking).status]?.label}</span>
                        </div>
                      </>
                    )}
                    {item.type === 'review' && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>Review: {(item.data as Review).destination.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#8B98A9', marginTop: '2px' }}>
                          Rating {(item.data as Review).rating}/5 ★
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8B98A9', flexShrink: 0 }}>
                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
              {itineraries.length === 0 && bookings.length === 0 && reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8B98A9' }}>
                  <Zap size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.9rem' }}>Belum ada aktivitas. Mulai petualanganmu!</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', boxShadow: '0 4px 20px rgba(10,74,94,0.05)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#F59E0B" /> Pencapaian
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {achievements.map(a => <AchievementBadge key={a.label} {...a} />)}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F8F6F2', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0A4A5E' }}>
                  {achievements.filter(a => a.unlocked).length} / {achievements.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>pencapaian terbuka</div>
                <div style={{ height: '6px', background: '#E5E9F0', borderRadius: '50px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`, background: 'linear-gradient(to right, #0A4A5E, #FF6B35)', borderRadius: '50px', transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>

            {/* Quick links + area map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Quick actions */}
              <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', boxShadow: '0 4px 20px rgba(10,74,94,0.05)' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#6366F1" /> Aksi Cepat
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Buat Smart Itinerary', icon: '🗺️', href: '/itinerary', color: '#0A4A5E', bg: '#EFF6FF' },
                    { label: 'Jelajahi Destinasi', icon: '🔍', href: '/destinasi', color: '#059669', bg: '#ECFDF5' },
                    { label: 'Lihat Semua Itinerary', icon: '📋', href: '#', onClick: 'itinerary', color: '#7C3AED', bg: '#F5F3FF' },
                    { label: 'Riwayat Booking', icon: '🎟️', href: '#', onClick: 'booking', color: '#B45309', bg: '#FFFBEB' },
                  ].map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '12px',
                        background: item.bg, border: `1.5px solid ${item.color}22`,
                        textDecoration: 'none', color: item.color, fontWeight: 700,
                        fontSize: '0.875rem', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)' }}
                    >
                      <span>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <ChevronRight size={15} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Areas visited */}
              {stats.uniqueAreas > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)', borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> Area Dijelajahi
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>{stats.uniqueAreas}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>dari 5 area Surabaya</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(stats.uniqueAreas / 5) * 100}%`, background: '#FF6B35', borderRadius: '50px' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MISSIONS TAB ── */}
        {activeTab === 'missions' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Award size={20} color="#FF6B35" /> Koleksi Medali
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#8B98A9', fontWeight: 700 }}>
                Terkumpul: {questList.filter(q => q.progress >= q.goal).length} / 30
              </div>
            </div>

            {/* Medals Grid (Carousel-like) */}
            <div style={{
              display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem',
              scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch'
            }}>
              {questList.map(q => {
                const isUnlocked = q.progress >= q.goal
                return (
                  <div key={`medal-${q.id}`} style={{
                    width: '70px', minWidth: '70px', height: '70px', borderRadius: '50%',
                    background: isUnlocked ? 'linear-gradient(135deg, #FFF3ED, #FFDCD1)' : '#F8FAFC',
                    border: `2px solid ${isUnlocked ? '#FF6B35' : '#E5E9F0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                    opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'drop-shadow(0 4px 10px rgba(255,107,53,0.3))' : 'grayscale(1)',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                  }} title={`${q.title} - ${isUnlocked ? 'Terbuka' : 'Terkunci'}`}>
                    {q.medal}
                    {isUnlocked && <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#10B981', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} /></div>}
                  </div>
                )
              })}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Daftar Tantangan
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {questList.map(q => {
                const isUnlocked = q.progress >= q.goal
                const percent = isUnlocked ? 100 : Math.min(100, (q.progress / q.goal) * 100)
                return (
                  <div key={q.id} style={{
                    background: isUnlocked ? '#FAFAFA' : 'white', borderRadius: '16px', padding: '1.25rem',
                    border: `1px solid ${isUnlocked ? '#E5E9F0' : '#E5E9F0'}`, position: 'relative', overflow: 'hidden',
                    boxShadow: isUnlocked ? 'none' : '0 4px 15px rgba(0,0,0,0.03)'
                  }}>
                    {isUnlocked && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '1.5rem', opacity: isUnlocked ? 1 : 0.5, filter: isUnlocked ? 'none' : 'grayscale(1)' }}>{q.medal}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1A2332', fontSize: '0.95rem', textDecoration: isUnlocked ? 'line-through' : 'none' }}>{q.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>+{q.pts} Pts</div>
                        </div>
                      </div>
                      {isUnlocked && <Check size={18} color="#10B981" />}
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px', minHeight: '34px' }}>
                      {q.desc}
                    </div>

                    {!isUnlocked && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8B98A9', fontWeight: 700, marginBottom: '6px' }}>
                          <span>Progres</span>
                          <span>{q.id >= 29 ? `Rp ${(q.progress/1000).toLocaleString('id-ID')}k / Rp ${(q.goal/1000).toLocaleString('id-ID')}k` : `${q.progress} / ${q.goal}`}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '50px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#FF6B35', borderRadius: '50px' }} />
                        </div>
                      </div>
                    )}
                    {isUnlocked && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textAlign: 'center', background: '#D1FAE5', padding: '4px', borderRadius: '6px' }}>
                        Tantangan Selesai
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ════ ITINERARY TAB ════ */}
        {activeTab === 'itinerary' && (() => {
          const kanvasItineraries = itineraries.filter(i => i.isCanvas)
          const fixItineraries = itineraries.filter(i => !i.isCanvas)
          
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1A2332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="#0A4A5E" /> Semua Itinerary ({itineraries.length})
                </h2>
                <Link href="/itinerary" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                  + Buat Itinerary Baru
                </Link>
              </div>

              {itineraries.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed #E5E9F0' }}>
                  <BookOpen size={48} color="#E5E9F0" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>Belum ada itinerary</h3>
                  <p style={{ color: '#8B98A9', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Mulai rencanakan perjalananmu dengan Smart Itinerary!</p>
                  <Link href="/itinerary" className="btn-primary">Buat Itinerary Pertama 🚀</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {fixItineraries.length > 0 && (
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1A2332', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Map size={18} color="#059669" /> Itinerary Fix ({fixItineraries.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                        {fixItineraries.map(renderItineraryCard)}
                      </div>
                    </div>
                  )}

                  {kanvasItineraries.length > 0 && (
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#8B98A9', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={18} /> Kanvas Kosong ({kanvasItineraries.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', opacity: 0.85 }}>
                        {kanvasItineraries.map(renderItineraryCard)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {/* ════ BOOKING TAB ════ */}
        {activeTab === 'booking' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1A2332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="#FF6B35" /> Riwayat Booking ({bookings.length})
              </h2>
              {stats.totalSpent > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FED7AA)', border: '1.5px solid #FDBA74', borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
                  💰 Total: Rp {stats.totalSpent.toLocaleString('id-ID')}
                </div>
              )}
            </div>

            {bookings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed #E5E9F0' }}>
                <Ticket size={48} color="#E5E9F0" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>Belum ada booking</h3>
                <p style={{ color: '#8B98A9', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Pesan tiket destinasi favoritmu sekarang!</p>
                <Link href="/destinasi" className="btn-primary">Jelajahi Destinasi 🔍</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => {
                  const sc = STATUS_COLOR[booking.status] ?? STATUS_COLOR.cancelled
                  return (
                    <div key={booking.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(10,74,94,0.04)' }}>
                      <div style={{ display: 'flex', gap: '0', alignItems: 'stretch', flexWrap: 'wrap' }}>
                        {/* Image */}
                        <div style={{ width: '100px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                          <img src={booking.destination.mainImage} alt={booking.destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '90px' }} />
                          <div style={{ position: 'absolute', top: '6px', left: '6px', background: booking.destination.categoryColor + 'CC', borderRadius: '50px', padding: '2px 7px', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>
                            {booking.destination.categoryIcon}
                          </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332', marginBottom: '4px' }}>{booking.destination.name}</div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#8B98A9', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {booking.destination.area}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} />
                                {new Date(booking.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#8B98A9', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span>🎟️ {booking.ticketCount} tiket</span>
                              {booking.totalPrice > 0 && <span>💳 Rp {booking.totalPrice.toLocaleString('id-ID')}</span>}
                              <span style={{ fontFamily: 'monospace', color: '#0A4A5E', fontWeight: 700 }}>#{booking.bookingCode}</span>
                            </div>
                          </div>

                          {/* Status + QR */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                            <div style={{
                              padding: '4px 12px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800,
                              background: sc.bg, color: sc.text,
                              display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot }} />
                              {sc.label}
                            </div>
                            <QRModal
                              bookingCode={booking.bookingCode}
                              destinationName={booking.destination.name}
                              visitDate={booking.visitDate}
                              ticketCount={booking.ticketCount}
                              totalPrice={booking.totalPrice}
                              status={booking.status}
                            />
                            <Link
                              href={`/wisata/${booking.destination.slug}`}
                              style={{ fontSize: '0.72rem', color: '#0A4A5E', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              Lihat destinasi <ExternalLink size={11} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <Link href="/destinasi" style={{ fontSize: '0.875rem', color: '#0A4A5E', fontWeight: 700, textDecoration: 'none' }}>
                    + Pesan tiket destinasi lainnya →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ REVIEW TAB ════ */}
        {activeTab === 'review' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1A2332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} color="#F59E0B" fill="#F59E0B" /> Review Saya ({reviews.length})
              </h2>
              {stats.avgRating && (
                <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
                  ⭐ Rata-rata: {stats.avgRating} / 5
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed #E5E9F0' }}>
                <Star size={48} color="#E5E9F0" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>Belum ada review</h3>
                <p style={{ color: '#8B98A9', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Kunjungi destinasi dan bagikan pengalamanmu!</p>
                <Link href="/destinasi" className="btn-primary">Jelajahi Destinasi 🔍</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(10,74,94,0.04)' }}>
                    {/* Destination banner */}
                    <div style={{ position: 'relative', height: '80px', overflow: 'hidden' }}>
                      <img src={review.destination.mainImage} alt={review.destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,30,50,0.5)' }} />
                      <Link href={`/wisata/${review.destination.slug}`} style={{ position: 'absolute', bottom: '8px', left: '12px', color: 'white', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>
                        {review.destination.name}
                      </Link>
                      <Link href={`/wisata/${review.destination.slug}`} style={{ position: 'absolute', bottom: '8px', right: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        <ExternalLink size={14} />
                      </Link>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} fill={i < review.rating ? '#F59E0B' : '#E5E9F0'} color={i < review.rating ? '#F59E0B' : '#E5E9F0'} />
                        ))}
                        <span style={{ marginLeft: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B' }}>{review.rating}/5</span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.7, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        "{review.comment}"
                      </p>

                      <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#8B98A9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ EVENTS TAB ════ */}
        {activeTab === 'events' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1A2332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#EF4444" /> Event Tersimpan ({savedEvents.length})
              </h2>
            </div>

            {savedEvents.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed #E5E9F0' }}>
                <Calendar size={48} color="#E5E9F0" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>Belum ada event tersimpan</h3>
                <p style={{ color: '#8B98A9', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Eksplorasi Kalender Event dan simpan yang menarik!</p>
                <Link href="/extras/kalender-event" className="btn-primary">Lihat Kalender Event 📅</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {savedEvents.map(s => {
                  const ev = s.event
                  return (
                    <div key={s.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(10,74,94,0.04)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                        <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', color: '#EF4444', padding: '6px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Heart size={16} fill="#EF4444" />
                        </div>
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#0A4A5E', color: 'white', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {ev.category}
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>{ev.title}</h3>
                        
                        <div style={{ display: 'flex', gap: '10px', color: '#8B98A9', fontSize: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} />
                            {new Date(ev.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(ev.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {ev.location}
                          </div>
                        </div>

                        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                          <Link href="/extras/kalender-event" style={{ fontSize: '0.875rem', color: '#0A4A5E', fontWeight: 700, textDecoration: 'none' }}>
                            Lihat di Kalender →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4,30,40,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(8px)', padding: '1rem',
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '450px',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ padding: '1.5rem 2rem', background: '#0A4A5E', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> Edit Profil
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ padding: '2rem' }}>
              {updateError && (
                <div style={{ padding: '12px', background: '#FEF2F2', color: '#DC2626', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #FCA5A5' }}>
                  {updateError}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1A2332', marginBottom: '8px' }}>Nama Lengkap</label>
                <input
                  type="text" required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E9F0', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', background: '#F8FAFC' }}
                  onFocus={e => e.target.style.borderColor = '#0A4A5E'}
                  onBlur={e => e.target.style.borderColor = '#E5E9F0'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1A2332', marginBottom: '8px' }}>Pilih Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {AVATARS.map(avatar => (
                    <button
                      type="button"
                      key={avatar}
                      onClick={() => setEditAvatar(avatar)}
                      style={{
                        width: '45px', height: '45px', borderRadius: '12px', fontSize: '1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: editAvatar === avatar ? '#FFF3ED' : '#F8FAFC',
                        border: `2px solid ${editAvatar === avatar ? '#FF6B35' : '#E5E9F0'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {avatar}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditAvatar('')}
                    style={{
                      padding: '0 12px', height: '45px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700,
                      background: editAvatar === '' ? '#FFF3ED' : '#F8FAFC',
                      color: editAvatar === '' ? '#FF6B35' : '#8B98A9',
                      border: `2px solid ${editAvatar === '' ? '#FF6B35' : '#E5E9F0'}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    Inisial
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #E5E9F0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1A2332', marginBottom: '12px' }}>Ganti Password (Opsional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="password"
                    placeholder="Password Lama"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E9F0', fontSize: '0.9rem', outline: 'none', background: '#F8FAFC' }}
                  />
                  <input
                    type="password"
                    placeholder="Password Baru"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E9F0', fontSize: '0.9rem', outline: 'none', background: '#F8FAFC' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#8B98A9', margin: 0, fontStyle: 'italic' }}>
                    *Kosongkan jika tidak ingin mengubah password
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: isUpdating ? '#8B98A9' : '#FF6B35', color: 'white',
                  fontWeight: 800, fontSize: '1rem', border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── POINTS INFO MODAL ── */}
      {showPointsInfo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4,30,40,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '32px', width: '100%', maxWidth: '420px',
            padding: '2.5rem', position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <button onClick={() => setShowPointsInfo(false)} style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F8FAFC',
              border: 'none', width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8B98A9'
            }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1A2332', margin: 0 }}>Cara Mendapatkan Poin</h2>
              <p style={{ color: '#8B98A9', fontSize: '0.95rem', marginTop: '8px' }}>Terus aktif di MlaKoow dan jadilah Legenda!</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#DBEAFE', color: '#3B82F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ticket size={20} /></div>
                  <div style={{ fontWeight: 800, color: '#1A2332', fontSize: '0.95rem' }}>Booking Tiket (Valid)</div>
                </div>
                <div style={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>+500</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#FEF3C7', color: '#F59E0B', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={20} /></div>
                  <div style={{ fontWeight: 800, color: '#1A2332', fontSize: '0.95rem' }}>Tulis Ulasan (Review)</div>
                </div>
                <div style={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>+250</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#E0E7FF', color: '#6366F1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={20} /></div>
                  <div style={{ fontWeight: 800, color: '#1A2332', fontSize: '0.95rem' }}>Buat Itinerary</div>
                </div>
                <div style={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>+150</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#FCE7F3', color: '#EC4899', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={20} /></div>
                  <div style={{ fontWeight: 800, color: '#1A2332', fontSize: '0.95rem' }}>Simpan Event</div>
                </div>
                <div style={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>+50</div>
              </div>
            </div>

            <button onClick={() => setShowPointsInfo(false)} style={{ width: '100%', padding: '1rem', background: '#0A4A5E', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, marginTop: '2rem', cursor: 'pointer', fontSize: '1rem' }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-column: span 2"] {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
