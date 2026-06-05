import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') return null
  return session
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const review = await prisma.review.findUnique({ where: { id: parseInt(id) } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.review.delete({ where: { id: parseInt(id) } })

  // Recalculate destination rating
  const remaining = await prisma.review.findMany({ where: { destinationId: review.destinationId } })
  const newRating = remaining.length > 0
    ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
    : 0

  await prisma.destination.update({
    where: { id: review.destinationId },
    data: { rating: newRating, reviewCount: remaining.length },
  })

  return NextResponse.json({ success: true })
}
