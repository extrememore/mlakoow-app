import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MLAKOOW — Smart Tourism Surabaya',
    short_name: 'MLAKOOW',
    description: 'Jelajahi destinasi wisata Surabaya, buat itinerary cerdas, dan pesan tiket langsung dari genggamanmu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F4F8',
    theme_color: '#0A4A5E',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'id-ID',
    categories: ['travel', 'lifestyle', 'navigation'],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Cari Destinasi',
        short_name: 'Destinasi',
        description: 'Temukan destinasi wisata Surabaya',
        url: '/destinasi',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Smart Itinerary',
        short_name: 'Itinerary',
        description: 'Buat rencana perjalanan cerdas',
        url: '/itinerary',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ],
    screenshots: [
      {
        src: '/screenshots/homepage.png',
        sizes: '1280x800',
        type: 'image/png',
        label: 'Homepage MLAKOOW',
      },
    ],
  }
}
