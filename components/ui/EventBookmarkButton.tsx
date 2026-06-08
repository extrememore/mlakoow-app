'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EventBookmarkButton({ eventId, initiallySaved, sessionExists }: { eventId: number, initiallySaved: boolean, sessionExists: boolean }) {
  const [saved, setSaved] = useState(initiallySaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!sessionExists) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/events/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(data.saved)
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      style={{
        background: saved ? '#FEF2F2' : '#F1F5F9',
        border: 'none',
        borderRadius: '50px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: loading ? 'not-allowed' : 'pointer',
        color: saved ? '#EF4444' : '#64748B',
        fontWeight: 600,
        fontSize: '0.85rem',
        transition: 'all 0.2s',
      }}
    >
      <Heart size={16} fill={saved ? '#EF4444' : 'none'} color={saved ? '#EF4444' : '#64748B'} />
      {saved ? 'Tersimpan' : 'Simpan Event'}
    </button>
  )
}
