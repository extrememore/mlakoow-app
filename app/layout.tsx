import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import Providers from '@/components/Providers'
import RegisterPWA from '@/components/RegisterPWA'
import ChatbotWidget from '@/components/shared/ChatbotWidget'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0A4A5E',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'MLAKOOW — Smart Tourism Surabaya',
  description:
    'Asisten perjalanan wisata hyperlocal untuk Kota Surabaya. Temukan destinasi, buat itinerary cerdas, dan nikmati Surabaya lebih mudah.',
  keywords: 'wisata surabaya, tourism surabaya, itinerary surabaya, destinasi surabaya, tempat wisata surabaya',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MLAKOOW',
    startupImage: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon.png', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'MLAKOOW — Smart Tourism Surabaya',
    description: 'Asisten perjalanan wisata hyperlocal untuk Kota Surabaya',
    type: 'website',
    images: [{ url: '/icons/icon-512x512.png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={outfit.variable}>
      <body className="min-h-screen" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
        <NextTopLoader color="#FF6B35" showSpinner={false} speed={300} zIndex={1600} />
        <Providers>
          <RegisterPWA />
          {children}
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  )
}

