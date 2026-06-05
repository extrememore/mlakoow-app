import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Login diperlukan untuk memberi review' }, { status: 401 })
  }

  const { destinationId, rating, comment } = await request.json()

  if (!destinationId || !rating || !comment) {
    return Response.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  const userId = parseInt(session.user.id as string)

  // Check if user already reviewed this destination
  const existing = await prisma.review.findFirst({
    where: { userId, destinationId },
  })

  if (existing) {
    return Response.json(
      { error: 'Anda sudah memberi review untuk destinasi ini' },
      { status: 400 }
    )
  }

  const review = await prisma.review.create({
    data: { userId, destinationId, rating, comment },
    include: { user: { select: { name: true, avatar: true } } },
  })

  // Update destination average rating
  const reviews = await prisma.review.findMany({ where: { destinationId } })
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.destination.update({
    where: { id: destinationId },
    data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
  })

  return Response.json(review, { status: 201 })
}
