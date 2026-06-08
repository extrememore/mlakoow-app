'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  destinationId: number
  style?: React.CSSProperties
  className?: string
  label?: string
  labelAdded?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function WishlistButton({
  destinationId,
  style,
  className,
  label = 'Tambah ke Wishlist',
  labelAdded = 'Tersimpan di Wishlist',
  size = 'md',
}: WishlistButtonProps) {
  const router = useRouter()
  const [inWishlist, setInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch(`/api/wishlist?check=${destinationId}`)
      .then((r) => {
        if (r.status === 401) { setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setInWishlist(data.inWishlist)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [destinationId])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Jika belum login, redirect ke /login
    setToggling(true)
    if (inWishlist) {
      const res = await fetch(`/api/wishlist?destinationId=${destinationId}`, { method: 'DELETE' })
      if (res.status === 401) { router.push('/login'); return }
      if (res.ok) setInWishlist(false)
    } else {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId }),
      })
      if (res.status === 401) { router.push('/login'); return }
      if (res.ok) setInWishlist(true)
    }
    setToggling(false)
  }

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16
  const padding = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 20px' : '0.9rem'
  const fontSize = size === 'sm' ? '0.8rem' : size === 'lg' ? '1rem' : '0.9rem'

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    justifyContent: 'center',
    display: 'flex',
    fontSize,
    padding,
    marginBottom: '0.75rem',
    background: inWishlist
      ? 'linear-gradient(135deg, #EF4444, #F97316)'
      : 'linear-gradient(135deg, #4C1D95, #7C3AED)',
    color: 'white',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 600,
    gap: '8px',
    alignItems: 'center',
    cursor: toggling || loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s',
    fontFamily: 'Outfit, sans-serif',
    ...style,
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggling || loading}
      className={className}
      style={defaultStyle}
    >
      <Heart size={iconSize} fill={inWishlist ? 'white' : 'none'} />
      {loading ? 'Memuat...' : toggling ? '...' : inWishlist ? labelAdded : label}
    </button>
  )
}
