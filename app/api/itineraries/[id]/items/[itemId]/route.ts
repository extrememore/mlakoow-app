import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, itemId } = await params
  const itineraryId = parseInt(id)
  const itineraryItemId = parseInt(itemId)

  const itinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId, userId: parseInt(session.user.id as string) },
  })

  if (!itinerary) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.itineraryItem.deleteMany({
    where: { id: itineraryItemId, itineraryId },
  })

  return NextResponse.json({ success: true })
}
