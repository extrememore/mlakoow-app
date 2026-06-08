'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Images, ArrowLeft } from 'lucide-react'

interface ImageGalleryProps {
  mainImage: string
  gallery: string[]
  altBase: string
  backLink?: string
}

export default function ImageGallery({ mainImage, gallery, altBase, backLink }: ImageGalleryProps) {
  // All images: main first, then gallery
  const allImages = [mainImage, ...gallery].filter(Boolean)

  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx)
    setLightbox(true)
  }

  const closeLightbox = () => setLightbox(false)

  const prev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % allImages.length)
  }, [allImages.length])

  const prevLightbox = useCallback(() => {
    setLightboxIdx((i) => (i - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const nextLightbox = useCallback(() => {
    setLightboxIdx((i) => (i + 1) % allImages.length)
  }, [allImages.length])

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prevLightbox, nextLightbox])

  // Reset loaded state on image change
  useEffect(() => { setImgLoaded(false) }, [activeIdx])

  if (allImages.length === 0) return null

  const hasMultiple = allImages.length > 1

  return (
    <>
      {/* ── Main display area ── */}
      <div style={{ position: 'relative', background: '#0A1828' }}>
        {/* Hero image */}
        <div
          style={{
            position: 'relative',
            height: 'clamp(320px, 45vw, 600px)',
            overflow: 'hidden',
            cursor: hasMultiple ? 'zoom-in' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `url(${allImages[activeIdx]}) center/cover no-repeat`
          }}
          onClick={() => openLightbox(activeIdx)}
        >
          {/* Heavy blur backdrop for wide screens */}
          <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(30px)', background: 'rgba(10,24,40,0.6)' }} />

          <img
            key={activeIdx}
            src={allImages[activeIdx]}
            alt={`${altBase} ${activeIdx + 1}`}
            style={{
              position: 'relative',
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              zIndex: 1
            }}
          />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,74,94,0.85) 0%, transparent 55%)',
            pointerEvents: 'none',
            zIndex: 2
          }} />

          {/* Overlay elements wrapper (aligned to 1200px) */}
          <div style={{ position: 'absolute', inset: 0, maxWidth: '1200px', margin: '0 auto', pointerEvents: 'none', zIndex: 5 }}>
            {/* Back button */}
            {backLink && (
              <a
                href={backLink}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: '1.5rem', left: '1.5rem',
                  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                  borderRadius: '50px', padding: '8px 16px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: 'white', fontSize: '0.85rem', fontWeight: 600,
                  textDecoration: 'none', pointerEvents: 'auto',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)' }}
              >
                <ArrowLeft size={16} /> Kembali
              </a>
            )}

            {/* Zoom hint */}
            {hasMultiple && (
              <div style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                borderRadius: '50px', padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: '5px',
                color: 'white', fontSize: '0.72rem', fontWeight: 600,
                pointerEvents: 'none'
              }}>
                <ZoomIn size={13} />
                Klik untuk perbesar
              </div>
            )}
          </div>

          {/* Image counter (aligned to 1200px wrapper) */}
          <div style={{ position: 'absolute', inset: 0, maxWidth: '1200px', margin: '0 auto', pointerEvents: 'none', zIndex: 5 }}>
            {hasMultiple && (
              <div style={{
                position: 'absolute', bottom: '1.5rem', right: '1.5rem',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                borderRadius: '50px', padding: '4px 10px',
                color: 'white', fontSize: '0.72rem', fontWeight: 700,
                pointerEvents: 'none'
              }}>
                {activeIdx + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Prev / Next arrows on hero */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', zIndex: 2,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', zIndex: 2,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)' }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* ── Thumbnail strip ── */}
        {hasMultiple && (
          <div style={{
            background: 'rgba(10,24,40,0.95)', backdropFilter: 'blur(10px)',
            padding: '10px 1.5rem',
            display: 'flex', gap: '8px', overflowX: 'auto',
            scrollbarWidth: 'thin',
          }}>
            {/* "All photos" chip */}
            <button
              onClick={() => openLightbox(0)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '0 12px', height: '64px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 700,
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            >
              <Images size={15} />
              {allImages.length} foto
            </button>

            {/* Thumbnails */}
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  flexShrink: 0, padding: 0, border: 'none', cursor: 'pointer',
                  borderRadius: '10px', overflow: 'hidden',
                  width: '96px', height: '64px',
                  outline: activeIdx === i ? '2.5px solid #FF6B35' : '2px solid transparent',
                  outlineOffset: '2px',
                  transform: activeIdx === i ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.18s',
                  opacity: activeIdx === i ? 1 : 0.65,
                }}
                onMouseEnter={(e) => { if (activeIdx !== i) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={(e) => { if (activeIdx !== i) e.currentTarget.style.opacity = '0.65' }}
                title={`Foto ${i + 1}`}
              >
                <img
                  src={img}
                  alt={`${altBase} ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox / Fullscreen Modal ── */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeInLightbox 0.2s ease',
          }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div style={{
            position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.12)', borderRadius: '50px',
            padding: '6px 16px', color: 'white', fontSize: '0.8rem', fontWeight: 700,
          }}>
            {lightboxIdx + 1} / {allImages.length}
          </div>

          {/* Prev */}
          {hasMultiple && (
            <button
              onClick={(e) => { e.stopPropagation(); prevLightbox() }}
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', zIndex: 10,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Main lightbox image */}
          <img
            src={allImages[lightboxIdx]}
            alt={`${altBase} ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '85vh',
              objectFit: 'contain', borderRadius: '12px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              animation: 'popInLightbox 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />

          {/* Next */}
          {hasMultiple && (
            <button
              onClick={(e) => { e.stopPropagation(); nextLightbox() }}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', zIndex: 10,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Thumbnail row in lightbox */}
          {hasMultiple && (
            <div style={{
              position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '6px', padding: '8px 16px',
              background: 'rgba(0,0,0,0.6)', borderRadius: '14px',
              backdropFilter: 'blur(10px)', maxWidth: '90vw', overflowX: 'auto',
            }}
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  style={{
                    flexShrink: 0, padding: 0, border: 'none', cursor: 'pointer',
                    borderRadius: '7px', overflow: 'hidden',
                    width: '54px', height: '36px',
                    outline: lightboxIdx === i ? '2px solid #FF6B35' : '2px solid transparent',
                    outlineOffset: '2px',
                    opacity: lightboxIdx === i ? 1 : 0.5,
                    transition: 'all 0.15s',
                  }}
                >
                  <img
                    src={img}
                    alt={`thumb ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInLightbox {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes popInLightbox {
          from { opacity: 0; transform: scale(0.92) }
          to { opacity: 1; transform: scale(1) }
        }
      `}</style>
    </>
  )
}
