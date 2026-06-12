'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, MapPin, Plus, LogOut, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/destinasi', label: 'Destinasi Saya', icon: MapPin },
  { href: '/owner/destinasi/tambah', label: 'Tambah Destinasi', icon: Plus },
]

export default function OwnerSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '240px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #3B0764 0%, #6D28D9 100%)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '34px', height: '34px', background: '#A855F7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏪</div>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>MLAKOOW</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Owner Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/owner' ? pathname === '/owner' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '12px', textDecoration: 'none',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
            }} className="owner-nav-item">
              <Icon size={17} />
              {label}
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }} className="owner-nav-item">
          <span style={{ fontSize: '1rem' }}>🌐</span> Lihat Website
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'rgba(255,107,53,0.8)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: '100%', fontFamily: 'Outfit, sans-serif' }} className="owner-nav-item">
          <LogOut size={16} /> Keluar
        </button>
      </div>

      <style>{`.owner-nav-item:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }`}</style>
    </aside>
  )
}
