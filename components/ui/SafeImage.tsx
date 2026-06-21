'use client'

import React, { useState } from 'react'

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  'wisata': '/placeholder/wisata.jpg',
  'kuliner': '/placeholder/kuliner.jpg',
  'cafe': '/placeholder/cafe.jpg',
  'hiburan': '/placeholder/hiburan.jpg',
  'oleh-oleh': '/placeholder/oleh-oleh.jpg',
}

function getCategoryPlaceholder(slug?: string): string {
  if (!slug) return '/placeholder/wisata.jpg'
  if (CATEGORY_PLACEHOLDERS[slug]) return CATEGORY_PLACEHOLDERS[slug]
  for (const key of Object.keys(CATEGORY_PLACEHOLDERS)) {
    if (slug.includes(key) || key.includes(slug)) return CATEGORY_PLACEHOLDERS[key]
  }
  return '/placeholder/wisata.jpg'
}

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  categorySlug?: string
}

export default function SafeImage({ src, fallbackSrc, categorySlug, alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)
  const resolvedFallback = fallbackSrc || getCategoryPlaceholder(categorySlug)

  return (
    <img
      src={error ? resolvedFallback : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}
