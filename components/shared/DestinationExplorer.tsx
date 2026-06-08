'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DestinationCard from '@/components/ui/DestinationCard'
import { Search, X, MapPin, ChevronDown } from 'lucide-react'

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  color: string
}

export interface Destination {
  id: number
  name: string
  slug: string
  area: string
  mainImage: string
  rating: number
  reviewCount: number
  ticketPrice: number
  featured: boolean
  hiddenGem: boolean
  estimatedDuration: number
  description: string
  category: Category
}

const AREAS = ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat']

interface DestinationExplorerProps {
  title: string
  subtitle?: string
  description?: string
  fixedCategory?: string
  excludeCategory?: string
  gradient?: string
  icon?: ReactNode
  showCategoryFilter?: boolean
  tags?: { label: string, value: string }[]
  customBanner?: ReactNode
}

export default function DestinationExplorer({
  title,
  subtitle,
  description,
  fixedCategory,
  excludeCategory,
  gradient = 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)',
  icon = <MapPin size={16} color="#FF8C5E" />,
  showCategoryFilter = false,
  tags = [],
  customBanner
}: DestinationExplorerProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(fixedCategory || '')
  const [selectedArea, setSelectedArea] = useState('')
  const [activeTag, setActiveTag] = useState('')

  const fetchDestinations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      
      const categoryToFetch = fixedCategory || selectedCategory
      if (categoryToFetch) params.set('category', categoryToFetch)
      
      if (excludeCategory && !categoryToFetch) params.set('excludeCategory', excludeCategory)
      if (selectedArea) params.set('area', selectedArea)
      
      if (activeTag === 'featured') params.set('featured', 'true')
      if (activeTag === 'hidden') params.set('hiddenGem', 'true')
      
      params.set('limit', '24')

      const res = await fetch(`/api/destinations?${params}`)
      const data = await res.json()
      setDestinations(data.destinations || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch destinations:', err)
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, selectedArea, activeTag, fixedCategory, excludeCategory])

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!fixedCategory && params.has('category')) setSelectedCategory(params.get('category') || '')
    if (params.has('search')) setSearch(params.get('search') || '')
    if (params.has('area')) setSelectedArea(params.get('area') || '')
    if (params.has('tag')) setActiveTag(params.get('tag') || '')
  }, [fixedCategory])

  useEffect(() => {
    if (showCategoryFilter) {
      // Load categories
      fetch('/api/destinations?limit=50' + (excludeCategory ? `&excludeCategory=${excludeCategory}` : ''))
        .then((r) => r.json())
        .then((d) => {
          const cats = new Map()
          ;(d.destinations || []).forEach((dest: Destination) => {
            if (!cats.has(dest.category.id)) cats.set(dest.category.id, dest.category)
          })
          setCategories(Array.from(cats.values()))
        })
        .catch(() => {})
    }
  }, [showCategoryFilter, excludeCategory])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  const hasFilters = search || (selectedCategory && !fixedCategory) || selectedArea || activeTag

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Page Header */}
      <div
        style={{
          background: gradient,
          padding: '3rem 1.5rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '10%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          {subtitle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {subtitle}
              </span>
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            {title}
          </h1>
          {description && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '580px', lineHeight: 1.7 }}>
              {description.replace('{total}', total > 0 ? `${total}` : '')}
            </p>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E9F0', padding: '1.25rem 1.5rem', position: 'sticky', top: '68px', zIndex: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} color="#8B98A9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari destinasi..."
              className="input-field"
              style={{ paddingLeft: '2.75rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
            />
          </div>

          {/* Category filter */}
          {showCategoryFilter && !fixedCategory && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
                style={{ paddingTop: '0.65rem', paddingBottom: '0.65rem', paddingRight: '2.5rem', appearance: 'none', cursor: 'pointer', minWidth: '160px' }}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#8B98A9" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          )}

          {/* Area filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="input-field"
              style={{ paddingTop: '0.65rem', paddingBottom: '0.65rem', paddingRight: '2.5rem', appearance: 'none', cursor: 'pointer', minWidth: '180px' }}
            >
              <option value="">Semua Area</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <ChevronDown size={16} color="#8B98A9" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Tag pills */}
          {tags && tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setActiveTag(tag.value)}
                  style={{
                    padding: '0.55rem 1rem', borderRadius: '50px',
                    border: activeTag === tag.value ? '2px solid rgba(0,0,0,0.8)' : '2px solid #E5E9F0',
                    background: activeTag === tag.value ? 'rgba(0,0,0,0.8)' : 'white',
                    color: activeTag === tag.value ? 'white' : '#4A5568',
                    fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedArea(''); setActiveTag('') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FEE2E2', border: 'none', borderRadius: '12px', padding: '0.65rem 1rem', color: '#B91C1C', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}
            >
              <X size={16} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', flex: 1, width: '100%' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', background: 'white' }}>
                <div className="skeleton" style={{ paddingTop: '58%', width: '100%' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '20px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#8B98A9' }}>
            <MapPin size={56} style={{ opacity: 0.25, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.5rem' }}>Tidak ditemukan</h3>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', color: '#4A5568', fontSize: '0.9rem' }}>
              Menampilkan <strong>{destinations.length}</strong> dari <strong>{total}</strong> destinasi
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {destinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  id={dest.id}
                  name={dest.name}
                  slug={dest.slug}
                  area={dest.area}
                  mainImage={dest.mainImage}
                  rating={dest.rating}
                  reviewCount={dest.reviewCount}
                  ticketPrice={dest.ticketPrice}
                  featured={dest.featured}
                  hiddenGem={dest.hiddenGem}
                  estimatedDuration={dest.estimatedDuration}
                  category={dest.category}
                  description={dest.description}
                />
              ))}
            </div>

            {customBanner}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
