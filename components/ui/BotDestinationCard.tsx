'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Star, Clock } from 'lucide-react'
import { Destination } from '@/components/shared/DestinationExplorer'

export default function BotDestinationCard({ id }: { id: number }) {
  const [dest, setDest] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/destinations/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setDest(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="w-full h-[120px] rounded-xl bg-gray-100 animate-pulse my-2 flex p-3 gap-3">
        <div className="w-[100px] h-full bg-gray-200 rounded-lg"></div>
        <div className="flex-1 flex flex-col gap-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!dest) return null

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden my-2 flex hover:shadow-md transition-shadow">
      <div 
        className="w-[100px] sm:w-[120px] bg-cover bg-center shrink-0" 
        style={{ backgroundImage: `url(${dest.mainImage})` }}
      />
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1 flex items-center gap-1">
            <span style={{ color: dest.category?.color || '#0A4A5E' }}>{dest.category?.icon} {dest.category?.name}</span>
          </div>
          <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-2">
            {dest.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={12} /> {dest.area}</span>
            <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-yellow-400" /> {dest.rating}</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#FF6B35]">
            {dest.ticketPrice === 0 ? 'Gratis' : `Rp${dest.ticketPrice.toLocaleString('id-ID')}`}
          </span>
          <Link 
            href={`/detail/${dest.slug}`} 
            target="_blank"
            className="text-[10px] font-bold px-3 py-1.5 bg-[#0A4A5E] text-white rounded-full hover:bg-[#062E3A] transition-colors"
          >
            Lihat
          </Link>
        </div>
      </div>
    </div>
  )
}
