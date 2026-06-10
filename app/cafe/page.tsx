import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { Coffee } from 'lucide-react'

export const metadata = {
  title: 'Cafe & Tempat Nongkrong Surabaya - MLAKOOW',
  description: 'Berburu cafe estetik, kedai kopi artisan, dan tempat nongkrong paling hits di Surabaya.',
}

export default function CafePage() {
  return (
    <DestinationExplorer
      title="Cafe & Tempat Nongkrong"
      subtitle="LIFESTYLE & NONGKRONG"
      description="Temukan {total} rekomendasi cafe estetik, kedai kopi artisan, dan tempat nongkrong paling nyaman di penjuru Surabaya."
      fixedCategory="cafe"
      showCategoryFilter={true}
      parentCategory="cafe"
      gradient="linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)"
      icon={<Coffee size={18} color="white" />}
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
    />
  )
}
