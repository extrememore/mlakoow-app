'use client'

import { signOut } from 'next-auth/react'
import { LogOut, X } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          border: '2px solid #FCA5A5',
          borderRadius: '50px',
          padding: '0.75rem 1.75rem',
          color: '#EF4444',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.9rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#FEF2F2'
          e.currentTarget.style.borderColor = '#EF4444'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.borderColor = '#FCA5A5'
        }}
      >
        <LogOut size={16} />
        Keluar dari Akun
      </button>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
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
            {/* Icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#FEF2F2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1.25rem',
            }}>
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
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '50px',
                  border: '2px solid #E5E9F0', background: 'white',
                  color: '#4A5568', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F4F8'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                Batal
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '50px',
                  border: 'none', background: '#EF4444',
                  color: 'white', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '6px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
              >
                <LogOut size={15} /> Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  )
}
