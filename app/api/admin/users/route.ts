import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') return null
  return session
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { bookings: true, reviews: true, itineraries: true } },
    },
  })

  return NextResponse.json(users)
}
