import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventAdminClient from './EventAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1A2332', marginBottom: '0.5rem' }}>Kelola Event</h1>
          <p style={{ color: '#8B98A9' }}>Atur semua acara dan festival untuk Kalender Event.</p>
        </div>
      </div>

      <EventAdminClient initialEvents={events} />
    </div>
  )
}
