'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, Loader } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    contact_email: '',
    whatsapp_number: '',
    facebook_link: '',
    instagram_link: '',
    tiktok_link: '',
    maintenance_mode: 'false',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }))
        }
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (res.ok) {
      alert('Pengaturan berhasil disimpan')
    } else {
      alert('Gagal menyimpan pengaturan')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#8B98A9' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="#0EA5E9" /> Pengaturan Situs
        </h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Konfigurasi global platform Mlakoow.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E9F0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem' }}>Kontak & Bantuan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>Email Kontak</label>
              <input type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', outline: 'none' }} placeholder="halo@mlakoow.com" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>Nomor WhatsApp</label>
              <input type="text" name="whatsapp_number" value={settings.whatsapp_number} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', outline: 'none' }} placeholder="6281234567890" />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #F0F4F8' }} />

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem' }}>Sosial Media</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>Instagram URL</label>
              <input type="url" name="instagram_link" value={settings.instagram_link} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', outline: 'none' }} placeholder="https://instagram.com/mlakoow" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>TikTok URL</label>
              <input type="url" name="tiktok_link" value={settings.tiktok_link} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', outline: 'none' }} placeholder="https://tiktok.com/@mlakoow" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>Facebook URL</label>
              <input type="url" name="facebook_link" value={settings.facebook_link} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', outline: 'none' }} placeholder="https://facebook.com/mlakoow" />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #F0F4F8' }} />

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem' }}>Sistem</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>Maintenance Mode</label>
            <select name="maintenance_mode" value={settings.maintenance_mode} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E9F0', outline: 'none', background: 'white' }}>
              <option value="false">Mati (Live)</option>
              <option value="true">Nyala (Sedang Perbaikan)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: '#8B98A9' }}>Jika menyala, pengguna biasa akan melihat halaman perbaikan (fitur di sisi publik perlu disesuaikan nanti).</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0A4A5E', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
            Simpan Pengaturan
          </button>
        </div>

      </div>
    </div>
  )
}
