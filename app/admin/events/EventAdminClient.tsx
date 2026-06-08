'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Calendar as CalIcon, MapPin } from 'lucide-react'
import { createEvent, updateEvent, deleteEvent } from './actions'

type EventType = {
  id: number
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  image: string
  category: string
  price: string
}

export default function EventAdminClient({ initialEvents }: { initialEvents: EventType[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    image: '',
    category: 'Festival',
    price: 'Gratis'
  })

  const handleOpenModal = (ev?: EventType) => {
    if (ev) {
      setEditingId(ev.id)
      setFormData({
        title: ev.title,
        description: ev.description,
        location: ev.location,
        startDate: new Date(ev.startDate).toISOString().split('T')[0],
        endDate: new Date(ev.endDate).toISOString().split('T')[0],
        image: ev.image,
        category: ev.category,
        price: ev.price
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        image: '',
        category: 'Festival',
        price: 'Gratis'
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      }
      if (editingId) {
        await updateEvent(editingId, payload)
        setEvents(events.map(ev => ev.id === editingId ? { ...ev, ...payload } : ev))
      } else {
        await createEvent(payload)
        window.location.reload()
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan event.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus event ini?')) {
      try {
        await deleteEvent(id)
        setEvents(events.filter(ev => ev.id !== id))
      } catch (err) {
        alert('Gagal menghapus event.')
      }
    }
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Tambah Event
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E5E9F0' }}>
              <th style={{ padding: '1rem', color: '#4A5568', fontWeight: 600, fontSize: '0.85rem' }}>EVENT</th>
              <th style={{ padding: '1rem', color: '#4A5568', fontWeight: 600, fontSize: '0.85rem' }}>KATEGORI</th>
              <th style={{ padding: '1rem', color: '#4A5568', fontWeight: 600, fontSize: '0.85rem' }}>TANGGAL</th>
              <th style={{ padding: '1rem', color: '#4A5568', fontWeight: 600, fontSize: '0.85rem' }}>HARGA</th>
              <th style={{ padding: '1rem', color: '#4A5568', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#8B98A9' }}>Belum ada data event.</td>
              </tr>
            ) : events.map(ev => (
              <tr key={ev.id} style={{ borderBottom: '1px solid #E5E9F0' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1A2332' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8B98A9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {ev.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ background: '#E0F2FE', color: '#0A4A5E', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {ev.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4A5568' }}>
                  {new Date(ev.startDate).toLocaleDateString('id-ID')} - {new Date(ev.endDate).toLocaleDateString('id-ID')}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#FF6B35' }}>
                  {ev.price}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleOpenModal(ev)} style={{ background: 'none', border: 'none', color: '#0A4A5E', cursor: 'pointer', padding: '6px' }} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }} title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingId ? 'Edit Event' : 'Tambah Event'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Judul Event</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }}>
                    {['Festival', 'Pameran', 'Musik', 'Budaya', 'Seni'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Lokasi</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Tanggal Mulai</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Tanggal Selesai</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Harga Tiket</label>
                  <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Contoh: Gratis atau Rp 50.000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>URL Gambar</label>
                  <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Deskripsi Lengkap</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E9F0' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.8rem 1.5rem', background: '#F0F4F8', color: '#4A5568', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={loading} style={{ padding: '0.8rem 1.5rem', background: '#FF6B35', color: 'white', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
