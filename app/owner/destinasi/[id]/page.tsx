'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import MapPickerWrapper from '@/components/admin/MapPickerWrapper'

interface Category { id: number; name: string; icon: string; children?: Category[] }
const AREAS = ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat']

export default function OwnerEditDestinasiPage() {
  const { id } = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [destName, setDestName] = useState('')
  const [destStatus, setDestStatus] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', categoryId: '',
    area: '', address: '', lat: '', lng: '',
    openHour: '', closeHour: '', ticketPrice: '0',
    mainImage: '', estimatedDuration: '60', facilities: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/owner/destinations/${id}`).then(r => r.json()),
      fetch('/api/destinations/categories').then(r => r.json()),
    ]).then(([dest, cats]) => {
      if (dest.error) { router.push('/owner/destinasi'); return }
      setCategories(cats)
      setDestName(dest.name)
      setDestStatus(dest.status)
      const facs = (() => { try { return JSON.parse(dest.facilities || '[]').join(', ') } catch { return '' } })()
      setForm({
        name: dest.name, slug: dest.slug, description: dest.description,
        categoryId: String(dest.categoryId), area: dest.area, address: dest.address,
        lat: String(dest.lat), lng: String(dest.lng),
        openHour: dest.openHour, closeHour: dest.closeHour,
        ticketPrice: String(dest.ticketPrice), mainImage: dest.mainImage,
        estimatedDuration: String(dest.estimatedDuration), facilities: facs,
      })
      setLoading(false)
    }).catch(() => router.push('/owner/destinasi'))
  }, [id, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'name') {
      setForm(prev => ({
        ...prev, name: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch(`/api/owner/destinations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        categoryId: parseInt(form.categoryId),
        lat: parseFloat(form.lat), lng: parseFloat(form.lng),
        ticketPrice: parseInt(form.ticketPrice) || 0,
        estimatedDuration: parseInt(form.estimatedDuration) || 60,
        facilities: form.facilities ? JSON.stringify(form.facilities.split(',').map(f => f.trim())) : '[]',
      }),
    })
    if (res.ok) {
      router.push('/owner/destinasi')
    } else {
      const d = await res.json(); setError(d.error || 'Gagal menyimpan')
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E9F0',
    fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none', boxSizing: 'border-box',
    background: 'white', color: '#1A2332',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#4A5568', marginBottom: '6px' }

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', paddingTop: '6rem', color: '#8B98A9' }}>
      <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '760px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/owner/destinasi" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B98A9', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332' }}>Edit Destinasi</h1>
        <p style={{ color: '#8B98A9', fontSize: '0.875rem', marginTop: '4px' }}>{destName}</p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px',
          padding: '5px 14px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700,
          background: destStatus === 'published' ? '#D1FAE5' : destStatus === 'pending' ? '#FEF3C7' : '#FEE2E2',
          color: destStatus === 'published' ? '#059669' : destStatus === 'pending' ? '#D97706' : '#DC2626',
        }}>
          {destStatus === 'published' ? '✓ Published' : destStatus === 'pending' ? '⏳ Menunggu Approval' : '✗ Ditolak'}
        </div>
        {destStatus === 'published' && (
          <div style={{ marginTop: '8px', background: '#FEF3C7', color: '#D97706', padding: '6px 14px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', gap: '6px', marginLeft: '8px' }}>
            ⚠️ Perubahan akan direview ulang oleh admin
          </div>
        )}
      </div>

      {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>📍 Informasi Dasar</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={labelStyle}>Nama Destinasi *</label><input name="name" value={form.name} onChange={handleChange} required style={inputStyle} /></div>
              <div><label style={labelStyle}>Slug (URL) *</label><input name="slug" value={form.slug} onChange={handleChange} required style={inputStyle} /></div>
            </div>
            <div><label style={labelStyle}>Deskripsi *</label><textarea name="description" value={form.description} onChange={handleChange} required rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Kategori *</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={inputStyle}>
                  <option value="">Pilih kategori...</option>
                  {categories.map(parent => (
                    parent.children && parent.children.length > 0 ? (
                      <optgroup key={parent.id} label={`${parent.icon} ${parent.name}`}>
                        {parent.children.map(child => (
                          <option key={child.id} value={child.id}>{child.icon} {child.name}</option>
                        ))}
                      </optgroup>
                    ) : (
                      <option key={parent.id} value={parent.id}>{parent.icon} {parent.name}</option>
                    )
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Area *</label>
                <select name="area" value={form.area} onChange={handleChange} style={inputStyle}>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Alamat *</label><input name="address" value={form.address} onChange={handleChange} required style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🕐 Operasional & Harga</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div><label style={labelStyle}>Jam Buka</label><input type="time" name="openHour" value={form.openHour} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Jam Tutup</label><input type="time" name="closeHour" value={form.closeHour} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Harga Tiket (Rp)</label><input type="number" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} min="0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Est. Kunjungan (mnt)</label><input type="number" name="estimatedDuration" value={form.estimatedDuration} onChange={handleChange} min="15" style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🗺️ Lokasi</h2>
          <MapPickerWrapper lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div><label style={labelStyle}>Lat</label><input name="lat" value={form.lat} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Lng</label><input name="lng" value={form.lng} onChange={handleChange} style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🖼️ Media & Fasilitas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>URL Foto Utama *</label>
              <input name="mainImage" value={form.mainImage} onChange={handleChange} required style={inputStyle} />
              {form.mainImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.mainImage} alt="preview" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px' }} />
              )}
            </div>
            <div><label style={labelStyle}>Fasilitas (pisahkan koma)</label><input name="facilities" value={form.facilities} onChange={handleChange} placeholder="Parkir, Toilet, Musholla" style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/owner/destinasi" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '50px', border: '2px solid #E5E9F0', background: 'white', color: '#4A5568', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Batal</Link>
          <button type="submit" disabled={saving} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '50px', background: '#6D28D9', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.8 : 1 }}>
            {saving ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
