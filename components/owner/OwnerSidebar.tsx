'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { LayoutDashboard, MapPin, Plus, LogOut, ChevronRight, Menu, X, Globe, MessageSquare } from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'

const navItems = [
  { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/destinasi', label: 'Destinasi Saya', icon: MapPin },
  { href: '/owner/destinasi/tambah', label: 'Tambah Destinasi', icon: Plus },
  { href: '/owner/interaksi', label: 'Interaksi', icon: MessageSquare },
]

export default function OwnerSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCollapsed(true)
        setMobileOpen(false)
      } else {
        setCollapsed(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isCollapsed = collapsed && !mobileOpen
  const sidebarWidth = isCollapsed ? '60px' : '240px'

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      {/* Brand */}
      <div style={{
        padding: isCollapsed ? '1.25rem 0' : '1.25rem 1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: isCollapsed ? 'column' : 'row', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
      }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#A855F7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🏪</div>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>MLAKOOW</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Owner Portal</div>
            </div>
          </div>
        ) : (
          <div style={{ width: '34px', height: '34px', background: '#A855F7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏪</div>
        )}
        <div style={{ display: 'flex', flexDirection: isCollapsed ? 'column' : 'row', alignItems: 'center', gap: '8px', marginTop: isCollapsed ? '16px' : 0 }}>
          <NotificationBell isCollapsed={isCollapsed} />
          {!onNav && (
            <button
              onClick={() => setCollapsed(c => !c)}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
            </button>
          )}
          {onNav && (
            <button onClick={onNav} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: isCollapsed ? '0.75rem 0.5rem' : '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/owner' ? pathname === '/owner' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={onNav}
              title={isCollapsed ? label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: isCollapsed ? 0 : '10px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '10px' : '10px 12px',
                borderRadius: '12px', textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
              className="owner-nav-item"
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
              {!isCollapsed && isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6, flexShrink: 0 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: isCollapsed ? '0.75rem 0.5rem' : '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" onClick={onNav} title={isCollapsed ? 'Lihat Website' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : '10px', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '10px' : '10px 12px', borderRadius: '12px', textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}
          className="owner-nav-item"
        >
          <Globe size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Lihat Website</span>}
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })} title={isCollapsed ? 'Keluar' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : '10px', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '10px' : '10px 12px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'rgba(255,107,53,0.8)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: '100%', fontFamily: 'Outfit, sans-serif' }}
          className="owner-nav-item"
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Keluar</span>}
        </button>
      </div>

      <style>{`
        .owner-nav-item:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }
      `}</style>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="owner-sidebar-desktop"
        style={{
          width: sidebarWidth, minHeight: '100vh',
          background: 'linear-gradient(180deg, #3B0764 0%, #6D28D9 100%)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          position: 'sticky', top: 0, height: '100vh',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 100,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="owner-mobile-toggle"
        onClick={() => setMobileOpen(o => !o)}
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 200,
          background: '#6D28D9', border: 'none', borderRadius: '10px',
          width: '40px', height: '40px', display: 'none',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div
        className="owner-sidebar-mobile"
        style={{
          position: 'fixed', top: 0, left: mobileOpen ? 0 : '-260px', bottom: 0,
          width: '240px', zIndex: 160,
          background: 'linear-gradient(180deg, #3B0764 0%, #6D28D9 100%)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <SidebarContent onNav={() => setMobileOpen(false)} />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .owner-sidebar-desktop { display: none !important; }
          .owner-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 768px) {
          .owner-sidebar-mobile { display: none !important; }
          .owner-mobile-toggle { display: none !important; }
        }
      `}</style>
    </>
  )
}
