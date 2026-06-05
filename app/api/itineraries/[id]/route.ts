import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const itineraryId = parseInt(id)

  const itinerary = await prisma.itinerary.findFirst({
    where: {
      id: itineraryId,
      userId: parseInt(session.user.id as string),
    },
    include: {
      items: {
        include: {
          destination: {
            include: { category: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!itinerary) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(itinerary)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const itineraryId = parseInt(id)

  // Pastikan itinerary milik user
  const itinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId, userId: parseInt(session.user.id as string) },
  })

  if (!itinerary) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.itinerary.delete({ where: { id: itineraryId } })
  return NextResponse.json({ success: true })
}
