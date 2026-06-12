'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import MapPickerWrapper from '@/components/admin/MapPickerWrapper'

interface Category {
  id: number
  name: string
  icon: string
  children?: Category[]
}

const AREAS = ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat']

export default function TambahDestinasiPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', categoryId: '',
    area: 'Surabaya Pusat', address: '', lat: '-7.2575', lng: '112.7521',
    openHour: '08:00', closeHour: '17:00', ticketPrice: '0',
    mainImage: '', estimatedDuration: '60', facilities: '', featured: false, hiddenGem: false,
  })

  useEffect(() => {
    fetch('/api/destinations/categories')
      .then(r => r.json())
      .then(setCategories)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm(prev => ({ ...prev, [name]: val }))

    // Auto-generate slug from name
    if (name === 'name') {
      setForm(prev => ({
        ...prev,
        name: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/destinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        gallery: '[]',
        facilities: form.facilities ? JSON.stringify(form.facilities.split(',').map(f => f.trim())) : '[]',
      }),
    })

    if (res.ok) {
      router.push('/admin/destinasi')
    } else {
      const err = await res.json()
      setError(err.error || 'Gagal menyimpan. Cek semua field sudah terisi.')
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E9F0',
    fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none', boxSizing: 'border-box',
    background: 'white', color: '#1A2332',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#4A5568', marginBottom: '6px',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '760px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/destinasi" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B98A9', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Kembali ke Destinasi
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332' }}>Tambah Destinasi Baru</h1>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>📍 Informasi Dasar</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nama Destinasi *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Taman Bungkul" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL) *</label>
                <input name="slug" value={form.slug} onChange={handleChange} required placeholder="e.g. taman-bungkul" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Deskripsi *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Deskripsi lengkap destinasi..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>

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

            <div>
              <label style={labelStyle}>Alamat *</label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="Alamat lengkap destinasi" style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🕐 Operasional & Tiket</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Jam Buka *</label>
              <input type="time" name="openHour" value={form.openHour} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Jam Tutup *</label>
              <input type="time" name="closeHour" value={form.closeHour} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Harga Tiket (Rp)</label>
              <input type="number" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} min="0" placeholder="0 = Gratis" style={inputStyle} />
            </div>
             <div>
              <label style={labelStyle}>Estimasi Kunjungan (mnt)</label>
              <input type="number" name="estimatedDuration" value={form.estimatedDuration} onChange={handleChange} min="15" placeholder="60" style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🗺️ Lokasi Peta</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <MapPickerWrapper
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Koordinat Lat</label>
                <input name="lat" value={form.lat} onChange={handleChange} placeholder="-7.2575" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Koordinat Lng</label>
                <input name="lng" value={form.lng} onChange={handleChange} placeholder="112.7521" style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🖼️ Media & Fasilitas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>URL Foto Utama *</label>
              <input name="mainImage" value={form.mainImage} onChange={handleChange} required placeholder="https://..." style={inputStyle} />
              {form.mainImage && (
                <img src={form.mainImage} alt="Preview" style={{ marginTop: '8px', width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px' }} onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
            <div>
              <label style={labelStyle}>Fasilitas (pisahkan dengan koma)</label>
              <input name="facilities" value={form.facilities} onChange={handleChange} placeholder="Parkir, Toilet, Musholla, Kantin" style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>⚙️ Status</h2>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { name: 'featured', label: '⭐ Featured', desc: 'Tampil di halaman utama' },
              { name: 'hiddenGem', label: '💎 Hidden Gem', desc: 'Tandai sebagai permata tersembunyi' },
            ].map(toggle => (
              <label key={toggle.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name={toggle.name}
                  checked={(form as any)[toggle.name]}
                  onChange={handleChange}
                  style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#0A4A5E' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>{toggle.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>{toggle.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/destinasi" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '50px', border: '2px solid #E5E9F0', background: 'white', color: '#4A5568', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            Batal
          </Link>
          <button type="submit" disabled={saving} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '50px', background: '#0A4A5E', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.8 : 1 }}>
            {saving ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : <><Save size={18} /> Simpan Destinasi</>}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
