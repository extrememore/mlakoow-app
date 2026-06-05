'use client'

import React, { useState } from 'react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export default function SafeImage({ src, fallbackSrc = '/placeholder.png', alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}
