import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to last 100 for now
    include: {
      user: { select: { id: true, name: true, role: true } }
    }
  })

  return NextResponse.json(logs)
}
