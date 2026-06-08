'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

interface MenuImageProps {
  src: string
  alt: string
}

export default function MenuImage({ src, alt }: MenuImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          flexShrink: 0, 
          width: '80px', 
          height: '80px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          cursor: 'zoom-in',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          const overlay = e.currentTarget.querySelector('.zoom-overlay') as HTMLElement
          if (overlay) overlay.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          const overlay = e.currentTarget.querySelector('.zoom-overlay') as HTMLElement
          if (overlay) overlay.style.opacity = '0'
        }}
      >
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div 
          className="zoom-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <ZoomIn color="white" size={24} />
        </div>
      </div>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
          >
            <X size={24} />
          </button>
          
          <img 
            src={src} 
            alt={alt} 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} 
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
