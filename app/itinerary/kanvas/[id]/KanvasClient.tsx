'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Map, MapPin, Trash2, Edit2, Check, ArrowLeft, Zap } from 'lucide-react'

interface Item {
  id: number
  destination: {
    id: number
    name: string
    mainImage: string
    categoryName: string
    area: string
  }
}

interface Props {
  itinerary: {
    id: number
    title: string
    items: Item[]
  }
}

export default function KanvasClient({ itinerary }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>(itinerary.items)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(itinerary.title)
  const [isSavingTitle, setIsSavingTitle] = useState(false)

  const handleSaveTitle = async () => {
    if (!title.trim() || title === itinerary.title) {
      setIsEditingTitle(false)
      setTitle(itinerary.title)
      return
    }

    setIsSavingTitle(true)
    try {
      const res = await fetch(`/api/itineraries/${itinerary.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan nama kanvas')
      setIsEditingTitle(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan saat menyimpan nama kanvas')
      setTitle(itinerary.title)
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Hapus destinasi ini dari kanvas?')) return

    try {
      const res = await fetch(`/api/itineraries/${itinerary.id}/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Gagal menghapus destinasi')
      setItems(prev => prev.filter(i => i.id !== itemId))
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan saat menghapus destinasi')
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/profil?tab=itinerary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B98A9', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0A4A5E'} onMouseLeave={e => e.currentTarget.style.color = '#8B98A9'}>
        <ArrowLeft size={16} /> Kembali ke Profil
      </Link>

      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem 2.5rem', boxShadow: '0 4px 20px rgba(10,74,94,0.06)', border: '1px solid #E5E9F0', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FFF3ED', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Map size={24} />
            </div>
            {isEditingTitle ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A2332', border: '1px solid #0A4A5E', borderRadius: '8px', padding: '4px 12px', outline: 'none', width: '100%', maxWidth: '400px' }}
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={isSavingTitle}
                  style={{ background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isSavingTitle ? 'not-allowed' : 'pointer' }}
                >
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#1A2332' }}>{title}</h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  style={{ background: 'none', border: 'none', color: '#8B98A9', cursor: 'pointer', padding: '4px' }}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          <Link href={`/itinerary?canvasId=${itinerary.id}`} style={{ textDecoration: 'none' }}>
            <button
              disabled={items.length === 0}
              style={{
                background: items.length > 0 ? 'linear-gradient(135deg, #0A4A5E, #1E6FA8)' : '#E5E9F0',
                color: items.length > 0 ? 'white' : '#8B98A9',
                border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '1rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: '8px', cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: items.length > 0 ? '0 8px 20px rgba(10,74,94,0.2)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={18} /> Generate Smart Itinerary
            </button>
          </Link>
        </div>
        <p style={{ color: '#8B98A9', margin: 0, fontSize: '0.95rem' }}>
          Ini adalah draf kanvas Anda. Kumpulkan destinasi impian Anda di sini sebelum meminta sistem kami untuk menyusunkan jadwal perjalanannya.
        </p>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Daftar Destinasi ({items.length})
      </h2>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed #E5E9F0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧳</div>
          <h3 style={{ fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>Kanvas Masih Kosong</h3>
          <p style={{ color: '#8B98A9', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Eksplorasi destinasi Surabaya dan tambahkan ke kanvas ini!</p>
          <Link href="/destinasi" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'inline-block' }}>Eksplor Destinasi</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                <img src={item.destination.mainImage} alt={item.destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(4,30,40,0.7)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {item.destination.categoryName}
                </div>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1A2332', lineHeight: 1.3 }}>{item.destination.name}</h3>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', flexShrink: 0 }}
                    title="Hapus dari kanvas"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B98A9', fontSize: '0.8rem', marginTop: 'auto' }}>
                  <MapPin size={14} /> {item.destination.area}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
