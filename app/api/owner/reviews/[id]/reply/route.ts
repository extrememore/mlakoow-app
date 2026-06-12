import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user ? parseInt((session.user as any).id) : null
  const role = (session?.user as any)?.role ?? ''

  if (!userId || role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reply } = await request.json()

  // Ensure this review belongs to a destination owned by the user
  const review = await prisma.review.findUnique({
    where: { id: parseInt(id) },
    include: { destination: true }
  })

  if (!review) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  if (review.destination.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: {
      ownerReply: reply,
      ownerReplyAt: new Date(),
    }
  })

  return NextResponse.json(updated)
}
