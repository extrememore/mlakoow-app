import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { Camera } from 'lucide-react'

export const metadata = {
  title: 'Spot Foto & Hiburan Surabaya - MLAKOOW',
  description: 'Temukan berbagai studio foto, photobox, arcade, dan aktivitas gaya hidup menarik lainnya di Surabaya.',
}

export default function HiburanPage() {
  return (
    <DestinationExplorer
      title="Spot Foto & Hiburan"
      subtitle="AKTIVITAS & GAYA HIDUP"
      description="Temukan {total} tempat hiburan modern, self-photo studio, photobox estetik, dan aktivitas seru untuk menghabiskan waktu luang."
      fixedCategory="hiburan,spot-foto"
      gradient="linear-gradient(135deg, #B45309 0%, #F59E0B 100%)"
      icon={<Camera size={18} color="white" />}
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
    />
  )
}
