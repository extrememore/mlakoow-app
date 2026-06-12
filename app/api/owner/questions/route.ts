import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  const userId = session?.user ? parseInt((session.user as any).id) : null
  const role = (session?.user as any)?.role ?? ''

  if (!userId || role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find destinations owned by this user
  const destinations = await prisma.destination.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true }
  })
  
  const destIds = destinations.map(d => d.id)

  const questions = await prisma.question.findMany({
    where: { destinationId: { in: destIds } },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      destination: { select: { name: true } },
      answers: {
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(questions)
}
