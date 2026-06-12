'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationBell({ isCollapsed }: { isCollapsed?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function handleMarkAsRead(id: number, link: string | null) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setOpen(false)
    if (link) {
      router.push(link)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="Notifikasi"
        style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', 
          width: '30px', height: '30px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', cursor: 'pointer', color: 'white', position: 'relative'
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', background: '#DC2626', color: 'white',
            fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0A4A5E'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: isCollapsed ? '0' : '0', 
          width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 999, overflow: 'hidden', border: '1px solid #E5E9F0'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E9F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1A2332' }}>Notifikasi</h3>
            <span style={{ fontSize: '0.75rem', color: '#8B98A9', fontWeight: 600 }}>{unreadCount} Baru</span>
          </div>
          
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8B98A9', fontSize: '0.85rem' }}>
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  style={{ 
                    padding: '12px 16px', borderBottom: '1px solid #F0F4F8', cursor: 'pointer',
                    background: n.isRead ? 'white' : '#F0F9FF', transition: 'background 0.2s',
                    display: 'flex', gap: '12px', alignItems: 'flex-start'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : '#0EA5E9', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A2332', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4A5568', lineHeight: 1.4, marginBottom: '4px' }}>{n.message}</div>
                    <div style={{ fontSize: '0.65rem', color: '#8B98A9', fontWeight: 600 }}>{new Date(n.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
