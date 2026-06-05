export type UserRole = 'user' | 'admin'

export interface UserSession {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface DestinationCard {
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
  category: {
    id: number
    name: string
    slug: string
    icon: string
    color: string
  }
}

export interface TransportOption {
  mode: string
  icon: string
  duration: string
  cost: string
  description: string
}

export const AREAS = [
  'Surabaya Pusat',
  'Surabaya Utara',
  'Surabaya Selatan',
  'Surabaya Timur',
  'Surabaya Barat',
] as const

export type Area = typeof AREAS[number]

export const TRANSPORT_OPTIONS: Record<string, TransportOption[]> = {
  default: [
    {
      mode: 'Grab/Gojek',
      icon: '🛵',
      duration: 'Sesuai jarak',
      cost: 'Rp 10.000 – 30.000',
      description: 'Pilihan paling praktis dan fleksibel',
    },
    {
      mode: 'Bus Suroboyo',
      icon: '🚌',
      duration: '+15 menit',
      cost: 'Rp 5.000',
      description: 'Tersedia di rute-rute utama Surabaya',
    },
    {
      mode: 'Angkot',
      icon: '🚐',
      duration: '+20 menit',
      cost: 'Rp 4.000 – 6.000',
      description: 'Untuk rute yang tidak terlayani bus',
    },
  ],
}
