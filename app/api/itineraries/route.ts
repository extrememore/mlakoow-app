import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'canvas' | 'generated' | null (all)

  const where: Record<string, unknown> = { userId: parseInt(session.user.id as string) }
  if (type === 'canvas') where.isCanvas = true
  if (type === 'generated') where.isCanvas = false

  const itineraries = await prisma.itinerary.findMany({
    where,
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
  const { title, duration, budget, area, items, totalEstimatedCost, notes, startDate, isCanvas } = body

  // Canvas creation: minimal fields, no items yet
  if (isCanvas) {
    const canvas = await prisma.itinerary.create({
      data: {
        userId: parseInt(session.user.id as string),
        title: title || 'Kanvas Itinerary',
        duration: 1,
        budget: 0,
        area: 'Semua Area',
        isCanvas: true,
      },
      include: {
        items: { include: { destination: { include: { category: true } } } },
      },
    })
    return Response.json(canvas, { status: 201 })
  }

  // Normal (generated) itinerary
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
      isCanvas: false,
      items: {
        create: (items || []).map((item: {
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
