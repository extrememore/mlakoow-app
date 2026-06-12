import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'

export const dynamic = 'force-dynamic'

// GET all non-published destinations (pending + rejected) for admin approval
export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const destinations = await prisma.destination.findMany({
    where: { status: { in: ['pending', 'rejected', 'published'] } },
    include: {
      category: true,
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: [
      { status: 'asc' },  // pending first
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(destinations)
}
