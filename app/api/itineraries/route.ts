import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const itineraries = await prisma.itinerary.findMany({
    where: { userId: parseInt(session.user.id as string) },
    include: {
      items: {
        include: { destination: { include: { category: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(itineraries)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, duration, budget, area, items, totalEstimatedCost, notes, startDate } = body

  const itinerary = await prisma.itinerary.create({
    data: {
      userId: parseInt(session.user.id as string),
      title,
      duration,
      budget,
      area,
      totalEstimatedCost: totalEstimatedCost || 0,
      notes,
      startDate: startDate ? new Date(startDate) : null,
      items: {
        create: items.map((item: {
          destinationId: number
          order: number
          estimatedVisitTime: number
          estimatedCost: number
          transportNote?: string
        }) => ({
          destinationId: item.destinationId,
          order: item.order,
          estimatedVisitTime: item.estimatedVisitTime,
          estimatedCost: item.estimatedCost,
          transportNote: item.transportNote,
        })),
      },
    },
    include: {
      items: {
        include: { destination: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  return Response.json(itinerary, { status: 201 })
}
