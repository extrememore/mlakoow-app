'use client'

import { useState } from 'react'
import { Star, Send, Loader, Pencil, Trash2, X, Check } from 'lucide-react'

interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  userId: number
  user: { name: string; avatar?: string | null }
}

interface ReviewSectionProps {
  destinationId: number
  destinationName: string
  initialReviews: Review[]
  initialRating: number
  initialCount: number
  isLoggedIn: boolean
  currentUserId?: number
  hasReviewed?: boolean
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Luar Biasa!']

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              transition: 'transform 0.1s',
              transform: (hover || value) >= star ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <Star
              size={32}
              fill={(hover || value) >= star ? '#F59E0B' : 'transparent'}
              color={(hover || value) >= star ? '#F59E0B' : '#CBD5E0'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600, minHeight: '18px' }}>
          {labels[hover || value]}
        </div>
      )}
    </div>
  )
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
      <span style={{ color: '#4A5568', width: '10px', textAlign: 'right' }}>{star}</span>
      <Star size={12} fill="#F59E0B" color="#F59E0B" />
      <div style={{ flex: 1, height: '8px', background: '#E5E9F0', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ color: '#8B98A9', width: '24px' }}>{count}</span>
    </div>
  )
}

export default function ReviewSection({
  destinationId,
  destinationName,
  initialReviews,
  initialRating,
  initialCount,
  isLoggedIn,
  currentUserId,
  hasReviewed: initialHasReviewed = false,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [avgRating, setAvgRating] = useState(initialRating)
  const [totalCount, setTotalCount] = useState(initialCount)
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed)

  // New review form
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  function recalcStats(updated: Review[]) {
    const avg = updated.length > 0 ? updated.reduce((s, r) => s + r.rating, 0) / updated.length : 0
    setAvgRating(Math.round(avg * 10) / 10)
    setTotalCount(updated.length)
  }

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Pilih rating bintang terlebih dahulu'); return }
    if (comment.trim().length < 10) { setError('Ulasan minimal 10 karakter'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId, rating, comment: comment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal mengirim ulasan'); setLoading(false); return }
      const newReview: Review = {
        id: data.id, rating, comment: comment.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUserId!,
        user: data.user,
      }
      const updated = [newReview, ...reviews]
      setReviews(updated)
      recalcStats(updated)
      setHasReviewed(true)
      setSuccess(true)
      setRating(0)
      setComment('')
    } catch { setError('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }

  function startEdit(review: Review) {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
    setEditError('')
  }

  async function handleSaveEdit(reviewId: number) {
    if (editRating === 0) { setEditError('Pilih rating bintang'); return }
    if (editComment.trim().length < 10) { setEditError('Minimal 10 karakter'); return }
    setEditError('')
    setEditLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setEditError(data.error || 'Gagal mengupdate'); setEditLoading(false); return }
      const updated = reviews.map(r =>
        r.id === reviewId ? { ...r, rating: editRating, comment: editComment.trim() } : r
      )
      setReviews(updated)
      recalcStats(updated)
      setEditingId(null)
    } catch { setEditError('Terjadi kesalahan.') }
    finally { setEditLoading(false) }
  }

  async function handleDelete(reviewId: number) {
    if (!confirm('Hapus ulasan ini?')) return
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      if (!res.ok) return
      const updated = reviews.filter(r => r.id !== reviewId)
      setReviews(updated)
      recalcStats(updated)
      setHasReviewed(false)
    } catch { /* silent */ }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
      <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', color: '#1A2332', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Star size={22} fill="#F59E0B" color="#F59E0B" /> Ulasan Pengunjung
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Left: Rating summary + bar chart */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#1A2332', lineHeight: 1 }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </div>
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', margin: '6px 0' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? '#F59E0B' : '#E5E9F0'} color={s <= Math.round(avgRating) ? '#F59E0B' : '#E5E9F0'} />
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>{totalCount} ulasan</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dist.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={totalCount} />
              ))}
            </div>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#8B98A9' }}>
              <Star size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Belum ada ulasan. Jadilah yang pertama!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {reviews.map(review => {
                const isOwner = currentUserId === review.userId
                const isEditing = editingId === review.id

                return (
                  <div key={review.id} style={{ padding: '1rem', background: isOwner ? '#F0F7FA' : '#F8F6F2', borderRadius: '14px', border: `1px solid ${isOwner ? '#BAE6FD' : '#E5E9F0'}` }}>
                    {/* Header */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0A4A5E, #FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                          {review.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {review.user.name}
                          {isOwner && <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '99px', padding: '1px 8px', fontWeight: 600 }}>Ulasanmu</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {!isEditing && (
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12} fill={s <= review.rating ? '#F59E0B' : '#E5E9F0'} color={s <= review.rating ? '#F59E0B' : '#E5E9F0'} />
                              ))}
                            </div>
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#8B98A9' }}>
                            {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {/* Edit/Delete buttons for owner */}
                      {isOwner && !isEditing && (
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button
                            onClick={() => startEdit(review)}
                            title="Edit ulasan"
                            style={{ background: 'white', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A4A5E' }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            title="Hapus ulasan"
                            style={{ background: 'white', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#EF4444' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline edit form */}
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <StarPicker value={editRating} onChange={setEditRating} />
                        <textarea
                          value={editComment}
                          onChange={e => setEditComment(e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '2px solid #0A4A5E', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {editError && <div style={{ fontSize: '0.8rem', color: '#EF4444' }}>⚠️ {editError}</div>}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ flex: 1, padding: '0.6rem', borderRadius: '50px', border: '1px solid #E5E9F0', background: 'white', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#4A5568' }}
                          >
                            <X size={14} /> Batal
                          </button>
                          <button
                            onClick={() => handleSaveEdit(review.id)}
                            disabled={editLoading}
                            style={{ flex: 1, padding: '0.6rem', borderRadius: '50px', border: 'none', background: '#0A4A5E', color: 'white', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            {editLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                            Simpan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#4A5568', lineHeight: 1.65, margin: 0 }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Review form */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>
            ✍️ Tulis Ulasan Kamu
          </h3>

          {!isLoggedIn ? (
            <div style={{ textAlign: 'center', padding: '2rem 0.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
              <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Login terlebih dahulu untuk berbagi pengalaman kamu di <strong>{destinationName}</strong>
              </p>
              <a href="/login" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                Login Sekarang
              </a>
            </div>
          ) : hasReviewed ? (
            <div style={{ textAlign: 'center', padding: '2rem 0.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Star size={28} fill="#10B981" color="#10B981" />
              </div>
              <p style={{ color: '#047857', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Ulasanmu sudah terkirim!
              </p>
              <p style={{ color: '#4A5568', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Terima kasih sudah berbagi pengalaman. Ulasanmu membantu wisatawan lain dalam memilih destinasi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Success toast */}
              {success && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '0.875rem', color: '#047857', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ✅ Ulasan berhasil dikirim! Terima kasih.
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#4A5568', marginBottom: '10px' }}>
                  Rating *
                </label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#4A5568', marginBottom: '8px' }}>
                  Ulasan *
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={`Ceritakan pengalamanmu di ${destinationName}... (min. 10 karakter)`}
                  rows={4}
                  style={{
                    width: '100%', padding: '0.875rem 1rem', borderRadius: '14px',
                    border: '2px solid #E5E9F0', fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.875rem', color: '#1A2332', resize: 'vertical',
                    outline: 'none', transition: 'border-color 0.15s', lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#0A4A5E'}
                  onBlur={e => e.currentTarget.style.borderColor = '#E5E9F0'}
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: comment.length < 10 ? '#EF4444' : '#8B98A9', marginTop: '4px' }}>
                  {comment.length} karakter
                </div>
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '0.75rem 1rem', color: '#B91C1C', fontSize: '0.85rem', fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', opacity: loading ? 0.8 : 1 }}
              >
                {loading ? (
                  <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Mengirim...</>
                ) : (
                  <><Send size={16} /> Kirim Ulasan</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
