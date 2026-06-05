'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { MapPin, Menu, X, User, LogOut, Map, Compass, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navLinks = [
    { href: '/destinasi', label: 'Destinasi' },
    { href: '/itinerary', label: 'Smart Itinerary' },
  ]

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const handleSignOut = () => {
    setUserMenuOpen(false)
    setShowLogoutConfirm(true)
  }

  const confirmSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  // Loading state — tampilkan skeleton sementara session dicek
  const isLoading = status === 'loading'

  return (
    <>
      <nav
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(229,233,240,0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 20px rgba(10,74,94,0.06)',
        }}
      >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0A4A5E 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0A4A5E', letterSpacing: '-0.5px', lineHeight: 1 }}>
              MLAKOOW
            </div>
            <div style={{ fontSize: '0.65rem', color: '#FF6B35', fontWeight: 600, letterSpacing: '0.5px' }}>
              SMART TOURISM SURABAYA
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive(link.href) ? '#0A4A5E' : '#4A5568',
                borderBottom: isActive(link.href) ? '2px solid #FF6B35' : '2px solid transparent',
                paddingBottom: '4px',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth — Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="hidden-mobile">
          {isLoading ? (
            // Skeleton saat session sedang dimuat
            <div
              style={{
                width: '120px',
                height: '38px',
                borderRadius: '50px',
                background: '#F0F4F8',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ) : session?.user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F0F7FA',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#0A4A5E',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0A4A5E, #FF6B35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                {session.user.name?.split(' ')[0]}
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    border: '1px solid #E5E9F0',
                  }}
                >
                  <Link
                    href="/profil"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 18px',
                      textDecoration: 'none',
                      color: '#1A2332',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                    className="menu-item"
                  >
                    <User size={16} color="#0A4A5E" />
                    Profil Saya
                  </Link>
                  <Link
                    href="/itinerary/riwayat"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 18px',
                      textDecoration: 'none',
                      color: '#1A2332',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                    className="menu-item"
                  >
                    <Map size={16} color="#0A4A5E" />
                    Itinerary Saya
                  </Link>
                  {(session.user as any).role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 18px',
                        textDecoration: 'none',
                        color: '#1A2332',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                      }}
                      className="menu-item"
                    >
                      <Compass size={16} color="#FF6B35" />
                      Admin Panel
                    </Link>
                  )}
                  <div style={{ borderTop: '1px solid #E5E9F0' }}>
                    <button
                      onClick={handleSignOut}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 18px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: '#E53E3E',
                      }}
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                Masuk
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#0A4A5E',
            display: 'none',
          }}
          className="show-mobile"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: '68px',
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #E5E9F0',
            padding: '1rem 1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="show-mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '0.85rem 0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.05rem',
                color: isActive(link.href) ? '#0A4A5E' : '#4A5568',
                borderBottom: '1px solid #E5E9F0',
              }}
            >
              {link.label}
            </Link>
          ))}
          
          {session?.user ? (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem' }}>
                Akun Saya
              </div>
              <Link
                href="/profil"
                onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 0', textDecoration: 'none', color: '#1A2332', fontWeight: 600, borderBottom: '1px solid #E5E9F0' }}
              >
                <User size={18} color="#0A4A5E" /> Profil Saya
              </Link>
              <Link
                href="/itinerary/riwayat"
                onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 0', textDecoration: 'none', color: '#1A2332', fontWeight: 600, borderBottom: '1px solid #E5E9F0' }}
              >
                <Map size={18} color="#0A4A5E" /> Itinerary Saya
              </Link>
              {(session.user as any).role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 0', textDecoration: 'none', color: '#1A2332', fontWeight: 600, borderBottom: '1px solid #E5E9F0' }}
                >
                  <Compass size={18} color="#FF6B35" /> Admin Panel
                </Link>
              )}
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 0', background: 'none', border: 'none', color: '#E53E3E', fontWeight: 600, fontFamily: 'Outfit, sans-serif', fontSize: '1rem', cursor: 'pointer', textAlign: 'left' }}
              >
                <LogOut size={18} /> Keluar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>
                Masuk
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}

    </nav>

      {/* Logout Confirmation Modal — rendered outside <nav> so position:fixed works correctly */}
      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '2rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
              animation: 'popIn 0.2s ease-out',
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <LogOut size={28} color="#EF4444" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A2332', marginBottom: '0.5rem' }}>
              Keluar dari Akun?
            </h3>
            <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Kamu akan keluar dari sesi ini. Pastikan semua aktivitasmu sudah tersimpan.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: '2px solid #E5E9F0', background: 'white', color: '#4A5568', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem' }}
              >
                Batal
              </button>
              <button
                onClick={confirmSignOut}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogOut size={15} /> Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
