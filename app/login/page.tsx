'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Email atau password salah. Silakan coba lagi.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 50%, #0D6E84 100%)',
      }}
    >
      {/* Left decorative */}
      <div
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          display: 'none',
        }}
        className="desktop-only"
      />

      {/* Form */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            width: '100%',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0A4A5E, #FF6B35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0A4A5E', letterSpacing: '-0.5px' }}>MLAKOOW</div>
              <div style={{ fontSize: '0.65rem', color: '#FF6B35', fontWeight: 600, letterSpacing: '0.5px' }}>SMART TOURISM SURABAYA</div>
            </div>
          </Link>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>
            Selamat Datang Kembali!
          </h1>
          <p style={{ color: '#4A5568', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Masuk untuk melanjutkan petualangan wisata Surabaya kamu
          </p>

          {error && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#B91C1C',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                fontWeight: 500,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#1A2332', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#8B98A9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#1A2332', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#8B98A9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8B98A9',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                fontSize: '1rem',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Masuk...
                </>
              ) : (
                <>
                  Masuk ke MLAKOOW
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>



          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#4A5568' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#0A4A5E', fontWeight: 700, textDecoration: 'none' }}>
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
