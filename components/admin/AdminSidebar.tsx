'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  MapPin,
  Ticket,
  Users,
  Star,
  LogOut,
  ChevronRight,
  Calendar,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/destinasi', label: 'Destinasi', icon: MapPin },
  { href: '/admin/bookings', label: 'Pemesanan', icon: Ticket },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/ulasan', label: 'Ulasan', icon: Star },
  { href: '/admin/events', label: 'Event', icon: Calendar },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #062E3A 0%, #0A4A5E 100%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '34px', height: '34px', background: '#FF6B35', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            🧭
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>MLAKOOW</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              className="admin-nav-item"
            >
              <Icon size={17} />
              {label}
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '4px',
          }}
          className="admin-nav-item"
        >
          <span style={{ fontSize: '1rem' }}>🌐</span> Lihat Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,107,53,0.8)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'Outfit, sans-serif',
          }}
          className="admin-nav-item"
        >
          <LogOut size={16} /> Keluar
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
}
