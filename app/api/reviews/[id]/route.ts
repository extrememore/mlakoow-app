import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const reviewId = parseInt(id)
  const userId = parseInt(session.user.id as string)

  const existing = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!existing) return Response.json({ error: 'Review tidak ditemukan' }, { status: 404 })
  if (existing.userId !== userId) return Response.json({ error: 'Bukan review milikmu' }, { status: 403 })

  const { rating, comment } = await request.json()
  if (!rating || !comment?.trim()) {
    return Response.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { rating, comment: comment.trim() },
    include: { user: { select: { name: true, avatar: true } } },
  })

  // Recalculate average rating
  const allReviews = await prisma.review.findMany({ where: { destinationId: existing.destinationId } })
  const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
  await prisma.destination.update({
    where: { id: existing.destinationId },
    data: { rating: Math.round(avgRating * 10) / 10 },
  })

  return Response.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const reviewId = parseInt(id)
  const userId = parseInt(session.user.id as string)

  const existing = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!existing) return Response.json({ error: 'Review tidak ditemukan' }, { status: 404 })
  if (existing.userId !== userId) return Response.json({ error: 'Bukan review milikmu' }, { status: 403 })

  await prisma.review.delete({ where: { id: reviewId } })

  // Recalculate
  const allReviews = await prisma.review.findMany({ where: { destinationId: existing.destinationId } })
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    : 0
  await prisma.destination.update({
    where: { id: existing.destinationId },
    data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length },
  })

  return Response.json({ success: true })
}
