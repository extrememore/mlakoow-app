import DestinationExplorer from '@/components/shared/DestinationExplorer'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Pencarian Destinasi - MLAKOOW',
  description: 'Cari destinasi wisata, kuliner, cafe, dan hiburan terbaik di Kota Surabaya.',
}

export default function PencarianPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''

  return (
    <DestinationExplorer
      title="Pencarian Destinasi"
      subtitle="HASIL PENCARIAN"
      description={`Menampilkan hasil pencarian untuk destinasi di Surabaya.`}
      gradient="linear-gradient(135deg, #062E3A 0%, #0A4A5E 100%)"
      icon={<Search size={18} color="white" />}
      showCategoryFilter={true}
      initialSearch={search}
      tags={[
        { label: 'Semua', value: '' },
        { label: '⭐ Populer', value: 'featured' },
        { label: '💎 Hidden Gem', value: 'hidden' }
      ]}
    />
  )
}
