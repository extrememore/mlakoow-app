'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'

export default function CTAJoin() {
  const { data: session, status } = useSession()

  // Jangan tampilkan CTA jika session sedang dicek atau user sudah login
  if (status === 'loading' || session?.user) return null

  return (
    <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '28px',
            padding: '3.5rem 2.5rem',
            boxShadow: '0 20px 60px rgba(10,74,94,0.1)',
            border: '1px solid #E5E9F0',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1A2332', marginBottom: '1rem' }}>
            Bergabung dengan MLAKOOW
          </h2>
          <p style={{ color: '#4A5568', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            Daftar gratis dan dapatkan akses penuh ke smart itinerary, simpan destinasi favorit, dan kelola rencana perjalanan kamu ke Surabaya.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary">
              Daftar Gratis
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary">
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
