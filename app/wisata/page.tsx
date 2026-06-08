import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { MapPin } from 'lucide-react'

export const metadata = {
  title: 'Wisata & Atraksi Surabaya - MLAKOOW',
  description: 'Temukan destinasi wisata terbaik di Kota Surabaya — dari landmark populer hingga taman kota dan museum bersejarah.',
}

export default function WisataPage() {
  return (
    <DestinationExplorer
      title="Wisata & Atraksi Surabaya"
      subtitle="DESTINASI WISATA"
      description="Temukan {total}+ destinasi wisata terbaik di Kota Surabaya — dari landmark populer hingga hidden gems."
      gradient="linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)"
      icon={<MapPin size={18} color="white" />}
      showCategoryFilter={true}
      excludeCategory="kuliner"
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
    />
  )
}
