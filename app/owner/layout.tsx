import type { Metadata } from 'next'
import OwnerSidebar from '@/components/owner/OwnerSidebar'

export const metadata: Metadata = {
  title: 'Owner Portal — MLAKOOW',
  description: 'Portal pengelola destinasi MLAKOOW',
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4F8', fontFamily: 'Outfit, sans-serif' }}>
      <OwnerSidebar />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
