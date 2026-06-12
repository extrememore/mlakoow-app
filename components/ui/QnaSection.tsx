'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, ChevronDown, ChevronUp, Send, LogIn } from 'lucide-react'
import Link from 'next/link'

type User = { id: number; name: string; avatar: string | null; role?: string }
type Answer = { id: number; content: string; createdAt: string; user: User }
type Question = {
  id: number
  content: string
  createdAt: string
  user: User
  answers: Answer[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#0A4A5E', '#FF6B35', '#7C3AED', '#10B981', '#F59E0B', '#EF4444']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function AnswerItem({ answer }: { answer: Answer }) {
  return (
    <div style={{
      display: 'flex', gap: '10px', padding: '12px 16px',
      background: '#F0F7FA', borderRadius: '12px',
    }}>
      <Avatar name={answer.user.name} size={30} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#1A2332' }}>{answer.user.name}</span>
          {answer.user.role === 'owner' && (
            <div style={{ background: '#A855F7', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '12px', fontWeight: 700 }}>👑 Owner</div>
          )}
          <span style={{ fontSize: '12px', color: '#8B98A9' }}>{timeAgo(answer.createdAt)}</span>
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65, margin: 0 }}>{answer.content}</p>
      </div>
    </div>
  )
}

function QuestionItem({
  question, isLoggedIn, currentUserId, onAnswerPosted
}: {
  question: Question
  isLoggedIn: boolean
  currentUserId?: number
  onAnswerPosted: (questionId: number, answer: Answer) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [posting, setPosting] = useState(false)

  const submitAnswer = async () => {
    if (!answerText.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/questions/${question.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerText.trim() }),
      })
      if (res.ok) {
        const newAnswer = await res.json()
        onAnswerPosted(question.id, newAnswer)
        setAnswerText('')
        setShowAnswerForm(false)
        setExpanded(true)
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #E8ECF0', borderRadius: '16px',
      overflow: 'hidden', transition: 'box-shadow 0.2s',
    }}>
      {/* Question header */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Avatar name={question.user.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A2332' }}>{question.user.name}</span>
              <span style={{ fontSize: '12px', color: '#8B98A9' }}>{timeAgo(question.createdAt)}</span>
              {question.answers.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                  borderRadius: '20px', background: '#E8F8F2', color: '#10B981',
                }}>
                  {question.answers.length} jawaban
                </span>
              )}
            </div>
            <p style={{ fontSize: '15px', color: '#1A2332', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              {question.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingLeft: '48px', flexWrap: 'wrap' }}>
          {question.answers.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 600, color: '#0A4A5E',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {expanded ? 'Sembunyikan' : `Lihat ${question.answers.length} jawaban`}
            </button>
          )}
          {isLoggedIn ? (
            <button
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 600,
                color: showAnswerForm ? '#EF4444' : '#FF6B35',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <MessageSquare size={14} />
              {showAnswerForm ? 'Batal' : 'Jawab'}
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 600, color: '#8B98A9', textDecoration: 'none',
              }}
            >
              <LogIn size={14} />
              Login untuk menjawab
            </Link>
          )}
        </div>
      </div>

      {/* Answers list */}
      {expanded && question.answers.length > 0 && (
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {question.answers.map(a => <AnswerItem key={a.id} answer={a} />)}
        </div>
      )}

      {/* Answer form */}
      {showAnswerForm && (
        <div style={{
          padding: '12px 20px 16px', borderTop: '1px solid #F0F2F5',
          background: '#FAFBFC', display: 'flex', gap: '10px', alignItems: 'flex-end',
        }}>
          <textarea
            value={answerText}
            onChange={e => setAnswerText(e.target.value)}
            placeholder="Tulis jawabanmu di sini..."
            rows={2}
            style={{
              flex: 1, resize: 'vertical', border: '1.5px solid #E0E4EA',
              borderRadius: '12px', padding: '10px 14px', fontSize: '14px',
              fontFamily: 'Outfit, sans-serif', color: '#1A2332', outline: 'none',
              background: '#fff', minHeight: '70px',
            }}
            onFocus={e => (e.target.style.borderColor = '#0A4A5E')}
            onBlur={e => (e.target.style.borderColor = '#E0E4EA')}
          />
          <button
            onClick={submitAnswer}
            disabled={!answerText.trim() || posting}
            style={{
              width: '42px', height: '42px', borderRadius: '50%', border: 'none',
              background: answerText.trim() && !posting ? 'linear-gradient(135deg, #0A4A5E, #0d5a72)' : '#E0E4EA',
              color: answerText.trim() && !posting ? '#fff' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: answerText.trim() && !posting ? 'pointer' : 'not-allowed',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            <Send size={16} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function QnaSection({
  destinationId,
  isLoggedIn,
  currentUserId,
}: {
  destinationId: number
  isLoggedIn: boolean
  currentUserId?: number
}) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetch(`/api/questions?destinationId=${destinationId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setQuestions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [destinationId])

  const handleAnswerPosted = (questionId: number, answer: Answer) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q)
    )
  }

  const submitQuestion = async () => {
    if (!newQuestion.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId, content: newQuestion.trim() }),
      })
      if (res.ok) {
        const q = await res.json()
        setQuestions(prev => [q, ...prev])
        setNewQuestion('')
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <section style={{
      background: '#F8F9FA', borderTop: '1px solid #E5E9F0', padding: '3rem 1.5rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.75rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #0A4A5E, #0d5a72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1A2332', margin: 0 }}>
              Tanya Komunitas
            </h2>
            <p style={{ fontSize: '14px', color: '#8B98A9', margin: '3px 0 0' }}>
              {questions.length > 0 ? `${questions.length} pertanyaan` : 'Belum ada pertanyaan'} — jadilah yang pertama bertanya!
            </p>
          </div>
        </div>

        {/* Ask question box */}
        {isLoggedIn ? (
          <div style={{
            background: '#fff', border: '1.5px solid #E8ECF0', borderRadius: '18px',
            padding: '20px', marginBottom: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '12px' }}>
              💬 Ada pertanyaan tentang tempat ini?
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="Contoh: Apakah ada tempat parkir motor? Ramai nggak di hari Minggu?"
                rows={2}
                style={{
                  flex: 1, resize: 'vertical', border: '1.5px solid #E0E4EA',
                  borderRadius: '14px', padding: '12px 16px', fontSize: '14.5px',
                  fontFamily: 'Outfit, sans-serif', color: '#1A2332', outline: 'none',
                  background: '#FAFBFC', minHeight: '70px',
                }}
                onFocus={e => (e.target.style.borderColor = '#0A4A5E')}
                onBlur={e => (e.target.style.borderColor = '#E0E4EA')}
              />
              <button
                onClick={submitQuestion}
                disabled={!newQuestion.trim() || posting}
                style={{
                  padding: '12px 22px', borderRadius: '14px', border: 'none',
                  background: newQuestion.trim() && !posting
                    ? 'linear-gradient(135deg, #0A4A5E, #0d5a72)'
                    : '#E0E4EA',
                  color: newQuestion.trim() && !posting ? '#fff' : '#9CA3AF',
                  fontWeight: 700, fontSize: '14px', cursor: newQuestion.trim() && !posting ? 'pointer' : 'not-allowed',
                  fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <Send size={15} />
                {posting ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff', border: '1.5px dashed #CBD5E0', borderRadius: '18px',
            padding: '24px', marginBottom: '1.5rem', textAlign: 'center',
          }}>
            <p style={{ color: '#6B7A90', fontSize: '15px', marginBottom: '14px' }}>
              🔐 Login untuk bertanya atau menjawab pertanyaan
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0A4A5E, #0d5a72)',
                color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              }}
            >
              <LogIn size={16} /> Login Sekarang
            </Link>
          </div>
        )}

        {/* Questions list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: '100px', background: '#fff', borderRadius: '16px',
                border: '1.5px solid #E8ECF0', animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            background: '#fff', borderRadius: '18px', border: '1.5px dashed #E0E4EA',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤔</div>
            <p style={{ fontWeight: 700, color: '#1A2332', fontSize: '16px', marginBottom: '6px' }}>
              Belum Ada Pertanyaan
            </p>
            <p style={{ color: '#8B98A9', fontSize: '14px' }}>
              Jadilah yang pertama bertanya tentang tempat ini!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questions.map(q => (
              <QuestionItem
                key={q.id}
                question={q}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                onAnswerPosted={handleAnswerPosted}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
