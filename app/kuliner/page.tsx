import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { UtensilsCrossed } from 'lucide-react'

export const metadata = {
  title: 'Kuliner Legendaris Surabaya - MLAKOOW',
  description: 'Temukan destinasi kuliner legendaris Surabaya — dari Rawon, Rujak Cingur, Pecel Semanggi, dan makanan khas lainnya.',
}

export default function KulinerPage() {
  return (
    <DestinationExplorer
      title="Kuliner Legendaris"
      subtitle="KULINER KHAS SURABAYA"
      description="Temukan {total} destinasi kuliner legendaris Surabaya — dari Rawon, Rujak Cingur, Pecel Semanggi, hingga hidangan otentik lainnya."
      fixedCategory="kuliner"
      gradient="linear-gradient(135deg, #7B1A00 0%, #C0392B 50%, #E67E22 100%)"
      icon={<UtensilsCrossed size={18} color="white" />}
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
    />
  )
}
