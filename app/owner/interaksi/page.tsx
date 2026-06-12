'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Star, Loader, CornerDownRight, Check, Send } from 'lucide-react'

export default function OwnerInteraksiPage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'qna'>('reviews')
  const [reviews, setReviews] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Reply states
  const [replyText, setReplyText] = useState<Record<number, string>>({})
  const [submittingReply, setSubmittingReply] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resReviews, resQuestions] = await Promise.all([
        fetch('/api/owner/reviews').then(r => r.json()),
        fetch('/api/owner/questions').then(r => r.json())
      ])
      setReviews(Array.isArray(resReviews) ? resReviews : [])
      setQuestions(Array.isArray(resQuestions) ? resQuestions : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewReply = async (reviewId: number) => {
    const text = replyText[reviewId]
    if (!text?.trim()) return

    setSubmittingReply(reviewId)
    const res = await fetch(`/api/owner/reviews/${reviewId}/reply`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text })
    })
    
    if (res.ok) {
      const updated = await res.json()
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ownerReply: updated.ownerReply, ownerReplyAt: updated.ownerReplyAt } : r))
      setReplyText(prev => ({ ...prev, [reviewId]: '' }))
    }
    setSubmittingReply(null)
  }

  const handleQuestionAnswer = async (questionId: number) => {
    const text = replyText[questionId]
    if (!text?.trim()) return

    setSubmittingReply(questionId)
    const res = await fetch(`/api/owner/questions/${questionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    })
    
    if (res.ok) {
      const newAnswer = await res.json()
      // Optimistic update
      setQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: [...(q.answers || []), { ...newAnswer, user: { name: 'Anda (Owner)', role: 'owner' } }]
          }
        }
        return q
      }))
      setReplyText(prev => ({ ...prev, [questionId]: '' }))
    }
    setSubmittingReply(null)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={26} color="#A855F7" /> Interaksi Pengunjung
        </h1>
        <p style={{ color: '#8B98A9', fontSize: '0.95rem' }}>Pantau ulasan dan jawab pertanyaan khusus untuk destinasi Anda.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E5E9F0', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '12px 24px', background: 'transparent', border: 'none',
            color: activeTab === 'reviews' ? '#A855F7' : '#8B98A9',
            borderBottom: activeTab === 'reviews' ? '3px solid #A855F7' : '3px solid transparent',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Star size={18} fill={activeTab === 'reviews' ? '#A855F7' : 'none'} /> Ulasan Destinasi
        </button>
        <button
          onClick={() => setActiveTab('qna')}
          style={{
            padding: '12px 24px', background: 'transparent', border: 'none',
            color: activeTab === 'qna' ? '#A855F7' : '#8B98A9',
            borderBottom: activeTab === 'qna' ? '3px solid #A855F7' : '3px solid transparent',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <MessageSquare size={18} /> Tanya Komunitas (Q&A)
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#8B98A9' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : activeTab === 'reviews' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', border: '1px dashed #CBD5E1' }}>
              <p style={{ color: '#8B98A9' }}>Belum ada ulasan untuk destinasi Anda.</p>
            </div>
          ) : reviews.map(review => (
            <div key={review.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1A2332' }}>{review.user?.name}</span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ color: '#8B98A9', fontSize: '0.85rem' }}>di {review.destination?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? '#FBBF24' : '#E5E9F0'} color={i < review.rating ? '#FBBF24' : '#E5E9F0'} />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#8B98A9' }}>{new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              <p style={{ color: '#4A5568', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{review.comment}</p>

              {review.ownerReply ? (
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginLeft: '1rem', borderLeft: '4px solid #A855F7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ background: '#A855F7', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>👑 Owner</div>
                    <span style={{ fontSize: '0.8rem', color: '#8B98A9' }}>Dibalas pada {new Date(review.ownerReplyAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p style={{ color: '#4A5568', fontSize: '0.9rem', margin: 0 }}>{review.ownerReply}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', marginLeft: '1rem' }}>
                  <CornerDownRight size={20} color="#CBD5E1" />
                  <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Tulis balasan untuk ulasan ini..."
                      value={replyText[review.id] || ''}
                      onChange={(e) => setReplyText(p => ({ ...p, [review.id]: e.target.value }))}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E9F0', outline: 'none', fontSize: '0.9rem' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleReviewReply(review.id)}
                    />
                    <button
                      onClick={() => handleReviewReply(review.id)}
                      disabled={submittingReply === review.id || !replyText[review.id]?.trim()}
                      style={{
                        background: '#A855F7', color: 'white', border: 'none', borderRadius: '10px', padding: '0 16px',
                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer',
                        opacity: (!replyText[review.id]?.trim() || submittingReply === review.id) ? 0.5 : 1
                      }}
                    >
                      {submittingReply === review.id ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                      Balas
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', border: '1px dashed #CBD5E1' }}>
              <p style={{ color: '#8B98A9' }}>Belum ada pertanyaan Q&A untuk destinasi Anda.</p>
            </div>
          ) : questions.map(question => (
            <div key={question.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1A2332' }}>{question.user?.name}</span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ color: '#8B98A9', fontSize: '0.85rem' }}>di {question.destination?.name}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A2332', margin: 0 }}>{question.content}</h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#8B98A9' }}>{new Date(question.createdAt).toLocaleDateString('id-ID')}</span>
              </div>

              {/* Answers */}
              {question.answers && question.answers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem', marginLeft: '1rem' }}>
                  {question.answers.map((answer: any) => {
                    const isOwner = answer.userId === question.destination.ownerId || answer.user?.role === 'owner'
                    return (
                      <div key={answer.id} style={{ background: isOwner ? '#F8FAFC' : '#FFFFFF', borderRadius: '12px', padding: '1rem', border: isOwner ? '1px solid #E5E9F0' : 'none', borderLeft: isOwner ? '4px solid #A855F7' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A2332' }}>{answer.user?.name}</span>
                          {isOwner && (
                            <div style={{ background: '#A855F7', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '12px', fontWeight: 700 }}>👑 Owner</div>
                          )}
                        </div>
                        <p style={{ color: '#4A5568', fontSize: '0.9rem', margin: 0 }}>{answer.content}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add Answer */}
              <div style={{ display: 'flex', gap: '10px', marginLeft: '1rem' }}>
                <CornerDownRight size={20} color="#CBD5E1" />
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Bantu jawab pertanyaan ini..."
                    value={replyText[question.id] || ''}
                    onChange={(e) => setReplyText(p => ({ ...p, [question.id]: e.target.value }))}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E9F0', outline: 'none', fontSize: '0.9rem' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuestionAnswer(question.id)}
                  />
                  <button
                    onClick={() => handleQuestionAnswer(question.id)}
                    disabled={submittingReply === question.id || !replyText[question.id]?.trim()}
                    style={{
                      background: '#A855F7', color: 'white', border: 'none', borderRadius: '10px', padding: '0 16px',
                      display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer',
                      opacity: (!replyText[question.id]?.trim() || submittingReply === question.id) ? 0.5 : 1
                    }}
                  >
                    {submittingReply === question.id ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                    Jawab
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
