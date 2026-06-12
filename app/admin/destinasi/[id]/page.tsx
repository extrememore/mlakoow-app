'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader, Plus, Trash2, Image, Eye } from 'lucide-react'
import MapPickerWrapper from '@/components/admin/MapPickerWrapper'
import { getDetailHref } from '@/lib/categoryRoutes'

interface Category { id: number; name: string; icon: string; slug: string; children?: Category[] }

const AREAS = ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat']

export default function EditDestinasiPage() {
  const { id } = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', categoryId: '',
    area: '', address: '', lat: '', lng: '',
    openHour: '', closeHour: '', ticketPrice: '0',
    mainImage: '', estimatedDuration: '60',
    facilities: '', featured: false, hiddenGem: false,
  })
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newGalleryUrl, setNewGalleryUrl] = useState('')
  const [newGalleryPreviewOk, setNewGalleryPreviewOk] = useState(false)

  // Menu state (for kuliner/cafe/oleh-oleh)
  interface MenuItem { name: string; price: number; description: string; image: string }
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [newMenu, setNewMenu] = useState<MenuItem>({ name: '', price: 0, description: '', image: '' })
  const [showMenuForm, setShowMenuForm] = useState(false)

  // Assign owner state
  const [currentOwner, setCurrentOwner] = useState<{ id: number; name: string; email: string } | null>(null)
  const [ownerEmailInput, setOwnerEmailInput] = useState('')
  const [ownerError, setOwnerError] = useState('')
  const [ownerLoading, setOwnerLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/destinations/${id}`).then(r => r.json()),
      fetch('/api/destinations/categories').then(r => r.json()),
    ]).then(([dest, cats]) => {
      setCategories(cats)
      const facs = (() => { try { return JSON.parse(dest.facilities || '[]').join(', ') } catch { return '' } })()
      const gals = (() => { try { return JSON.parse(dest.gallery || '[]') } catch { return [] } })()
      setForm({
        name: dest.name, slug: dest.slug, description: dest.description,
        categoryId: String(dest.categoryId), area: dest.area, address: dest.address,
        lat: String(dest.lat), lng: String(dest.lng),
        openHour: dest.openHour, closeHour: dest.closeHour,
        ticketPrice: String(dest.ticketPrice), mainImage: dest.mainImage,
        estimatedDuration: String(dest.estimatedDuration), facilities: facs,
        featured: dest.featured, hiddenGem: dest.hiddenGem,
      })
      setGalleryUrls(gals)
      // Load menus
      try { setMenus(JSON.parse(dest.menus || '[]')) } catch { setMenus([]) }
      // Load owner
      if (dest.owner) setCurrentOwner(dest.owner)
      setLoading(false)
    })
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm(prev => ({ ...prev, [name]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch(`/api/admin/destinations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, slug: form.slug, description: form.description,
        categoryId: parseInt(form.categoryId), area: form.area, address: form.address,
        lat: parseFloat(form.lat), lng: parseFloat(form.lng),
        openHour: form.openHour, closeHour: form.closeHour,
        ticketPrice: parseInt(form.ticketPrice) || 0, mainImage: form.mainImage,
        estimatedDuration: parseInt(form.estimatedDuration) || 60,
        facilities: form.facilities ? JSON.stringify(form.facilities.split(',').map((f: string) => f.trim())) : '[]',
        gallery: JSON.stringify(galleryUrls),
        menus: JSON.stringify(menus),
        featured: form.featured, hiddenGem: form.hiddenGem,
      }),
    })

    if (res.ok) {
      router.push('/admin/destinasi')
    } else {
      setError('Gagal menyimpan perubahan.')
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

  if (loading) return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <Loader size={32} color="#0A4A5E" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '760px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/admin/destinasi" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B98A9', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Kembali ke Destinasi
          </Link>
          {form.slug && form.categoryId && (() => {
            const catId = parseInt(form.categoryId)
            const cat = categories.find(c => c.id === catId)
              ?? categories.flatMap(c => c.children ?? []).find(c => c.id === catId)
            const href = cat ? getDetailHref(form.slug, cat.slug) : null
            return href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '50px', background: '#D1FAE5', color: '#059669', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                <Eye size={14} /> Lihat di Website
              </a>
            ) : null
          })()}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginTop: '1rem' }}>Edit Destinasi</h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem', marginTop: '4px' }}>{form.name}</p>
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
                <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL) *</label>
                <input name="slug" value={form.slug} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Deskripsi *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
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
              <input name="address" value={form.address} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🕐 Operasional & Tiket</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div><label style={labelStyle}>Jam Buka</label><input type="time" name="openHour" value={form.openHour} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Jam Tutup</label><input type="time" name="closeHour" value={form.closeHour} onChange={handleChange} style={inputStyle} /></div>
             <div><label style={labelStyle}>Harga Tiket (Rp)</label><input type="number" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} min="0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Est. Kunjungan (mnt)</label><input type="number" name="estimatedDuration" value={form.estimatedDuration} onChange={handleChange} min="15" style={inputStyle} /></div>
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
              <div><label style={labelStyle}>Koordinat Lat</label><input name="lat" value={form.lat} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Koordinat Lng</label><input name="lng" value={form.lng} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>🖼️ Media & Fasilitas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>URL Foto Utama *</label>
              <input name="mainImage" value={form.mainImage} onChange={handleChange} required style={inputStyle} />
              {form.mainImage && (
                <img src={form.mainImage} alt="Preview" style={{ marginTop: '8px', width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px' }} onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>

            {/* Gallery editor */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>
                🖼️ Galeri Foto ({galleryUrls.length} foto)
              </label>

              {/* Existing gallery thumbnails */}
              {galleryUrls.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
                  {galleryUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid #E5E9F0', background: '#F8F6F2' }}>
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.setAttribute('style', 'display:flex') }}
                      />
                      {/* Error fallback */}
                      <div style={{ display: 'none', height: '90px', alignItems: 'center', justifyContent: 'center', color: '#8B98A9', fontSize: '0.7rem', flexDirection: 'column', gap: '4px' }}>
                        <Image size={20} color="#8B98A9" />
                        <span>Gagal load</span>
                      </div>
                      {/* Overlay: index + delete */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                      >
                        <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '50px', alignSelf: 'flex-start' }}>#{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => setGalleryUrls(prev => prev.filter((_, j) => j !== i))}
                          style={{
                            alignSelf: 'flex-end', width: '26px', height: '26px', borderRadius: '50%',
                            background: '#EF4444', border: 'none', color: 'white',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          title="Hapus foto ini"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#F8F6F2', borderRadius: '12px', border: '2px dashed #E5E9F0', marginBottom: '1rem' }}>
                  <Image size={28} color="#8B98A9" style={{ marginBottom: '6px' }} />
                  <p style={{ fontSize: '0.82rem', color: '#8B98A9', margin: 0 }}>Belum ada foto galeri. Tambahkan di bawah.</p>
                </div>
              )}

              {/* Add new URL */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={e => { setNewGalleryUrl(e.target.value); setNewGalleryPreviewOk(false) }}
                    placeholder="https://example.com/foto.jpg"
                    style={{ ...inputStyle, borderColor: newGalleryUrl ? '#0A4A5E' : '#E5E9F0' }}
                  />
                  {/* Live preview of new URL */}
                  {newGalleryUrl && (
                    <img
                      src={newGalleryUrl}
                      alt="preview"
                      onLoad={() => setNewGalleryPreviewOk(true)}
                      onError={() => setNewGalleryPreviewOk(false)}
                      style={{ marginTop: '6px', width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', display: newGalleryPreviewOk ? 'block' : 'none' }}
                    />
                  )}
                  {newGalleryUrl && !newGalleryPreviewOk && (
                    <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '4px', fontWeight: 600 }}>⚠️ URL tidak dapat dimuat — pastikan URL gambar valid</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newGalleryUrl.trim() && !galleryUrls.includes(newGalleryUrl.trim())) {
                      setGalleryUrls(prev => [...prev, newGalleryUrl.trim()])
                      setNewGalleryUrl('')
                      setNewGalleryPreviewOk(false)
                    }
                  }}
                  disabled={!newGalleryUrl.trim()}
                  style={{
                    padding: '10px 16px', borderRadius: '10px', border: 'none',
                    background: newGalleryUrl.trim() ? '#0A4A5E' : '#E5E9F0',
                    color: newGalleryUrl.trim() ? 'white' : '#8B98A9',
                    fontWeight: 700, fontSize: '0.85rem', cursor: newGalleryUrl.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, height: '42px',
                    fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                  }}
                >
                  <Plus size={16} /> Tambah
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#8B98A9', marginTop: '6px' }}>
                💡 Masukkan URL gambar publik. Klik hover thumbnail untuk menghapus.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Fasilitas (pisahkan dengan koma)</label>
              <input name="facilities" value={form.facilities} onChange={handleChange} placeholder="Parkir, Toilet, Musholla" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Menu & Harga Section */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', margin: 0 }}>🍽️ Menu &amp; Harga</h2>
              <p style={{ fontSize: '0.78rem', color: '#8B98A9', margin: '2px 0 0' }}>Untuk destinasi kuliner, cafe, dan oleh-oleh</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMenuForm(v => !v)}
              style={{ padding: '7px 14px', borderRadius: '10px', background: '#E0F2FE', color: '#0A4A5E', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          {/* Add menu form */}
          {showMenuForm && (
            <div style={{ background: '#F0F7FA', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem', border: '1px dashed #BAE6FD' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0A4A5E', marginBottom: '0.75rem' }}>Item Menu Baru</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Nama Menu *</label>
                  <input value={newMenu.name} onChange={e => setNewMenu(p => ({ ...p, name: e.target.value }))} placeholder="Rujak Cingur Spesial" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Harga (Rp) *</label>
                  <input type="number" value={newMenu.price} onChange={e => setNewMenu(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} min="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={labelStyle}>Deskripsi (opsional)</label>
                <input value={newMenu.description} onChange={e => setNewMenu(p => ({ ...p, description: e.target.value }))} placeholder="Deskripsi singkat menu..." style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>URL Foto Menu (opsional)</label>
                <input value={newMenu.image} onChange={e => setNewMenu(p => ({ ...p, image: e.target.value }))} placeholder="https://..." style={inputStyle} />
                {newMenu.image && <img src={newMenu.image} alt="preview" style={{ marginTop: '6px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!newMenu.name.trim()) return
                    setMenus(prev => [...prev, { ...newMenu }])
                    setNewMenu({ name: '', price: 0, description: '', image: '' })
                    setShowMenuForm(false)
                  }}
                  style={{ padding: '8px 18px', borderRadius: '10px', background: '#0A4A5E', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                >
                  ✓ Simpan Item
                </button>
                <button type="button" onClick={() => setShowMenuForm(false)} style={{ padding: '8px 16px', borderRadius: '10px', background: '#E5E9F0', color: '#4A5568', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Batal</button>
              </div>
            </div>
          )}

          {/* Menu list */}
          {menus.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '12px', border: '2px dashed #E5E9F0' }}>
              <p style={{ color: '#8B98A9', fontSize: '0.85rem', margin: 0 }}>Belum ada item menu. Klik "Tambah Item" untuk menambahkan.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {menus.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#F8FAFC', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E5E9F0' }}>
                  {m.image && <img src={m.image} alt={m.name} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.currentTarget.style.display = 'none'} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{m.name}</div>
                    {m.description && <div style={{ fontSize: '0.78rem', color: '#8B98A9' }}>{m.description}</div>}
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0A4A5E', marginTop: '2px' }}>
                      {m.price === 0 ? 'Gratis' : `Rp ${m.price.toLocaleString('id-ID')}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenus(prev => prev.filter((_, j) => j !== i))}
                    style={{ padding: '6px', borderRadius: '8px', background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign Owner Section */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '4px' }}>🏪 Pengelola Destinasi (Owner)</h2>
          <p style={{ fontSize: '0.78rem', color: '#8B98A9', marginBottom: '1.25rem' }}>Assign pemilik/pengelola destinasi ini. Owner dapat mengedit destinasi melalui portal mereka.</p>
          {currentOwner ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#EDE9FE', padding: '0.875rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                {currentOwner.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{currentOwner.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#6D28D9' }}>{currentOwner.email}</div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Hapus owner dari destinasi ini?')) return
                  await fetch(`/api/admin/destinations/${id}/assign-owner`, { method: 'DELETE' })
                  setCurrentOwner(null)
                }}
                style={{ padding: '6px 12px', borderRadius: '8px', background: '#FEE2E2', border: 'none', color: '#DC2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                Hapus Owner
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                value={ownerEmailInput}
                onChange={e => { setOwnerEmailInput(e.target.value); setOwnerError('') }}
                placeholder="Email pengguna dengan role owner..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', outline: 'none', background: 'white' }}
              />
              <button
                type="button"
                disabled={ownerLoading || !ownerEmailInput}
                onClick={async () => {
                  setOwnerLoading(true); setOwnerError('')
                  const res = await fetch(`/api/admin/destinations/${id}/assign-owner`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: ownerEmailInput }),
                  })
                  const data = await res.json()
                  if (res.ok) { setCurrentOwner(data.owner); setOwnerEmailInput('') }
                  else setOwnerError(data.error || 'Gagal assign owner')
                  setOwnerLoading(false)
                }}
                style={{ padding: '10px 18px', borderRadius: '10px', background: '#6D28D9', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: ownerLoading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}
              >
                {ownerLoading ? 'Memproses...' : '+ Assign Owner'}
              </button>
            </div>
          )}
          {ownerError && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '6px', fontWeight: 600 }}>⚠️ {ownerError}</p>}
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E5E9F0', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>⚙️ Status</h2>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { name: 'featured', label: '⭐ Featured', desc: 'Tampil di halaman utama' },
              { name: 'hiddenGem', label: '💎 Hidden Gem', desc: 'Tandai sebagai permata tersembunyi' },
            ].map(toggle => (
              <label key={toggle.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" name={toggle.name} checked={(form as any)[toggle.name]} onChange={handleChange} style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#0A4A5E' }} />
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
            {saving ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
