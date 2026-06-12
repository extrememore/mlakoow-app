'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, MapPin, Ticket, Users, Star, LogOut,
  ChevronRight, Calendar, MessageCircle, CheckSquare, Menu, X, Globe, Activity, Settings
} from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/destinasi', label: 'Destinasi', icon: MapPin },
  { href: '/admin/approval', label: 'Approval Destinasi', icon: CheckSquare },
  { href: '/admin/bookings', label: 'Pemesanan', icon: Ticket },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/ulasan', label: 'Ulasan', icon: Star },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: Activity },
  { href: '/admin/pertanyaan', label: 'Tanya Komunitas', icon: MessageCircle },
  { href: '/admin/events', label: 'Event', icon: Calendar },
  { href: '/admin/settings', label: 'Pengaturan Situs', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-collapse on small screens
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

  // Close mobile panel on nav
  function handleNavClick() {
    if (window.innerWidth < 768) setMobileOpen(false)
  }

  const sidebarWidth = collapsed && !mobileOpen ? '60px' : '240px'

  const sidebar = (
    <aside
      style={{
        width: sidebarWidth,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #062E3A 0%, #0A4A5E 100%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {/* Brand + toggle */}
      <div style={{ padding: collapsed && !mobileOpen ? '1.25rem 0' : '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: collapsed && !mobileOpen ? 'center' : 'space-between' }}>
        {(!collapsed || mobileOpen) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#FF6B35', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              🧭
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>MLAKOOW</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
            </div>
          </div>
        )}
        {collapsed && !mobileOpen && (
          <div style={{ width: '34px', height: '34px', background: '#FF6B35', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            🧭
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: collapsed && !mobileOpen ? 0 : '8px', marginTop: collapsed && !mobileOpen ? '8px' : 0 }}>
          <NotificationBell isCollapsed={collapsed && !mobileOpen} />
          <button
            onClick={() => collapsed ? setCollapsed(false) : setCollapsed(true)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '8px',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
              flexShrink: 0,
            }}
          >
            {collapsed && !mobileOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed && !mobileOpen ? '0.75rem 0.5rem' : '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              title={collapsed && !mobileOpen ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed && !mobileOpen ? 0 : '10px',
                padding: collapsed && !mobileOpen ? '10px' : '10px 12px',
                justifyContent: collapsed && !mobileOpen ? 'center' : 'flex-start',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
              className="admin-nav-item"
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {(!collapsed || mobileOpen) && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
              {(!collapsed || mobileOpen) && isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6, flexShrink: 0 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed && !mobileOpen ? '0.75rem 0.5rem' : '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          href="/"
          onClick={handleNavClick}
          title={collapsed && !mobileOpen ? 'Lihat Website' : undefined}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed && !mobileOpen ? 0 : '10px',
            justifyContent: collapsed && !mobileOpen ? 'center' : 'flex-start',
            padding: collapsed && !mobileOpen ? '10px' : '10px 12px',
            borderRadius: '12px', textDecoration: 'none',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px',
          }}
          className="admin-nav-item"
        >
          <Globe size={17} style={{ flexShrink: 0 }} />
          {(!collapsed || mobileOpen) && <span style={{ whiteSpace: 'nowrap' }}>Lihat Website</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title={collapsed && !mobileOpen ? 'Keluar' : undefined}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed && !mobileOpen ? 0 : '10px',
            justifyContent: collapsed && !mobileOpen ? 'center' : 'flex-start',
            padding: collapsed && !mobileOpen ? '10px' : '10px 12px',
            borderRadius: '12px', background: 'transparent', border: 'none',
            color: 'rgba(255,107,53,0.8)', fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', width: '100%', fontFamily: 'Outfit, sans-serif',
          }}
          className="admin-nav-item"
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {(!collapsed || mobileOpen) && <span style={{ whiteSpace: 'nowrap' }}>Keluar</span>}
        </button>
      </div>

      <style>{`
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
        }
      `}</style>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        {sidebar}
      </div>

      {/* Mobile: hamburger floating button */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen(prev => !prev)}
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 200,
          background: '#0A4A5E', border: 'none', borderRadius: '10px',
          width: '40px', height: '40px', display: 'none',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className="admin-sidebar-mobile"
        style={{
          position: 'fixed', top: 0, left: mobileOpen ? 0 : '-260px', bottom: 0,
          width: '240px', zIndex: 160,
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
          background: 'linear-gradient(180deg, #062E3A 0%, #0A4A5E 100%)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Mobile sidebar header */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#FF6B35', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧭</div>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem' }}>MLAKOOW</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationBell isCollapsed={false} />
            <button onClick={() => setMobileOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <X size={16} />
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: isActive ? 'white' : 'rgba(255,255,255,0.55)', background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent', fontWeight: isActive ? 700 : 500, fontSize: '0.875rem' }}
                className="admin-nav-item"
              >
                <Icon size={17} />
                {label}
                {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }} className="admin-nav-item">
            <Globe size={17} /> Lihat Website
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'rgba(255,107,53,0.8)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: '100%', fontFamily: 'Outfit, sans-serif' }} className="admin-nav-item">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 768px) {
          .admin-sidebar-mobile { display: none !important; }
          .admin-mobile-toggle { display: none !important; }
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
        }
      `}</style>
    </>
  )
}
