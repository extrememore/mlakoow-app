'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QRModal } from '@/components/ui/QRModal'
import LogoutButton from '@/components/ui/LogoutButton'
import {
  BookOpen, Ticket, Star, MapPin, Calendar, Wallet, ArrowRight,
  TrendingUp, Award, Clock, User, Mail, ChevronRight, QrCode, ExternalLink,
  Map, Heart, Zap, Shield,
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
  { id: 'itinerary', label: '🗺️ Itinerary', icon: BookOpen },
  { id: 'booking', label: '🎟️ Booking', icon: Ticket },
  { id: 'review', label: '⭐ Review', icon: Star },
  { id: 'events', label: '📅 Event Tersimpan', icon: Calendar },
]

export default function ProfileClient({ data }: Props) {
  const { user: initialUser, stats, itineraries, bookings, reviews, savedEvents } = data
  const [user, setUser] = useState(initialUser)
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'overview')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState(initialUser.name)
  const [editAvatar, setEditAvatar] = useState(initialUser.avatar || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

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

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const initial = user.name.charAt(0).toUpperCase()
  const memberSince = new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const achievements = [
    { icon: '🌟', label: 'Petualang Pertama', desc: 'Buat itinerary pertama', unlocked: stats.itineraryCount >= 1 },
    { icon: '🎟️', label: 'Traveler Aktif', desc: 'Booking 1 tiket', unlocked: stats.confirmedBookings >= 1 },
    { icon: '🗺️', label: 'Multi-Area Explorer', desc: 'Kunjungi 2+ area', unlocked: stats.uniqueAreas >= 2 },
    { icon: '✍️', label: 'Reviewer Andal', desc: 'Tulis 3 review', unlocked: stats.reviewCount >= 3 },
    { icon: '📅', label: 'Planner Pro', desc: 'Trip 5+ hari total', unlocked: stats.totalDays >= 5 },
    { icon: '💰', label: 'Big Spender', desc: 'Total belanja Rp 500rb+', unlocked: stats.totalSpent >= 500000 },
  ]

  const renderItineraryCard = (itin: Itinerary) => (
    <Link key={itin.id} href={`/itinerary/${itin.id}`} style={{ textDecoration: 'none' }}>
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
            <ArrowRight size={15} color="#8B98A9" style={{ flexShrink: 0 }} />
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

            {/* Logout */}
            <div style={{ flexShrink: 0 }}>
              <LogoutButton />
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
