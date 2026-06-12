'use client'

import { useState, useEffect } from 'react'
import { Trash2, MessageCircle, MessageSquare, Loader, ChevronDown, ChevronUp, Search } from 'lucide-react'
import Link from 'next/link'

interface Answer {
  id: number
  content: string
  createdAt: string
  user: { id: number; name: string }
}

interface Question {
  id: number
  content: string
  createdAt: string
  user: { id: number; name: string; email: string }
  destination: { id: number; name: string; slug: string }
  answers: Answer[]
}

export default function AdminQnaPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [deletingQ, setDeletingQ] = useState<number | null>(null)
  const [deletingA, setDeletingA] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/questions')
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false) })
  }, [])

  const filtered = questions.filter(q =>
    !search ||
    q.content.toLowerCase().includes(search.toLowerCase()) ||
    q.user.name.toLowerCase().includes(search.toLowerCase()) ||
    q.destination.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function deleteQuestion(id: number) {
    if (!confirm('Hapus pertanyaan ini beserta semua jawabannya?')) return
    setDeletingQ(id)
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    setQuestions(prev => prev.filter(q => q.id !== id))
    setDeletingQ(null)
  }

  async function deleteAnswer(questionId: number, answerId: number) {
    if (!confirm('Hapus jawaban ini?')) return
    setDeletingA(answerId)
    await fetch(`/api/admin/answers/${answerId}`, { method: 'DELETE' })
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, answers: q.answers.filter(a => a.id !== answerId) }
        : q
    ))
    setDeletingA(null)
  }

  const totalAnswers = questions.reduce((s, q) => s + q.answers.length, 0)

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>
          Moderasi Tanya Komunitas
        </h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>
          {questions.length} pertanyaan • {totalAnswers} jawaban
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '420px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8B98A9' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari pertanyaan, pengguna, atau destinasi..."
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            borderRadius: '12px', border: '1.5px solid #E5E9F0',
            fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif',
            outline: 'none', background: 'white',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#8B98A9' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#8B98A9', background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0' }}>
          <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Tidak ada pertanyaan ditemukan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(q => (
            <div key={q.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
              {/* Question Header */}
              <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0A4A5E, #1A7CA0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                }}>
                  {q.user.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{q.user.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#8B98A9' }}>{q.user.email}</span>
                    <span style={{ fontSize: '0.72rem', color: '#8B98A9' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: '#8B98A9' }}>
                      {new Date(q.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Destination badge */}
                  <Link href={`/wisata/${q.destination.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                    <span style={{
                      display: 'inline-block', fontSize: '0.72rem', fontWeight: 600,
                      color: '#0A4A5E', background: '#E0F2FE', padding: '3px 10px',
                      borderRadius: '20px', marginBottom: '8px',
                    }}>
                      📍 {q.destination.name}
                    </span>
                  </Link>

                  {/* Question content */}
                  <p style={{ fontSize: '0.9rem', color: '#1A2332', margin: 0, lineHeight: 1.6 }}>
                    {q.content}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                  <button
                    onClick={() => toggleExpand(q.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '8px',
                      background: '#F0F7FA', border: '1px solid #BAE6FD',
                      color: '#0A4A5E', fontWeight: 600, fontSize: '0.78rem',
                      cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <MessageSquare size={13} />
                    {q.answers.length}
                    {expanded.has(q.id) ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <button
                    onClick={() => deleteQuestion(q.id)}
                    disabled={deletingQ === q.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '8px',
                      background: '#FEE2E2', border: 'none',
                      color: '#DC2626', fontWeight: 600, fontSize: '0.78rem',
                      cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {deletingQ === q.id
                      ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      : <Trash2 size={13} />}
                    Hapus
                  </button>
                </div>
              </div>

              {/* Answers (expandable) */}
              {expanded.has(q.id) && (
                <div style={{ borderTop: '1px solid #F0F4F8', background: '#FAFBFC' }}>
                  {q.answers.length === 0 ? (
                    <p style={{ padding: '1rem 1.5rem', fontSize: '0.82rem', color: '#8B98A9' }}>Belum ada jawaban</p>
                  ) : q.answers.map(a => (
                    <div key={a.id} style={{
                      display: 'flex', gap: '10px', padding: '0.875rem 1.5rem',
                      borderBottom: '1px solid #F0F4F8', alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0,
                      }}>
                        {a.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A2332' }}>{a.user.name}</span>
                          <span style={{ fontSize: '0.7rem', color: '#8B98A9' }}>
                            {new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>{a.content}</p>
                      </div>
                      <button
                        onClick={() => deleteAnswer(q.id, a.id)}
                        disabled={deletingA === a.id}
                        style={{
                          padding: '4px 10px', borderRadius: '8px', background: '#FEE2E2',
                          border: 'none', color: '#DC2626', cursor: 'pointer',
                          fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        }}
                      >
                        {deletingA === a.id
                          ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
                          : <Trash2 size={11} />}
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
