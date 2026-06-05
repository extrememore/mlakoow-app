'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader, CheckCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Terjadi kesalahan')
      setLoading(false)
      return
    }

    // Auto login after register
    await signIn('credentials', { email, password, redirect: false })
    router.push('/')
    router.refresh()
  }

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 50%, #FF6B35 200%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
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
            Buat Akun Baru
          </h1>
          <p style={{ color: '#4A5568', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Bergabung dan mulai jelajahi Surabaya bersama MLAKOOW
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
                Nama Lengkap
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#8B98A9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama kamu"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

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
                  placeholder="Minimal 6 karakter"
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
              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '2px',
                        background:
                          passwordStrength >= level
                            ? level === 1
                              ? '#EF4444'
                              : level === 2
                              ? '#F59E0B'
                              : '#10B981'
                            : '#E5E9F0',
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '0.75rem', color: '#8B98A9', marginLeft: '4px' }}>
                    {passwordStrength === 1 ? 'Lemah' : passwordStrength === 2 ? 'Sedang' : 'Kuat'}
                  </span>
                </div>
              )}
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
                  Mendaftar...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Buat Akun
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#4A5568' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#0A4A5E', fontWeight: 700, textDecoration: 'none' }}>
              Masuk di sini
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
