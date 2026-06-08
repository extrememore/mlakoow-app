import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { type NextRequest } from 'next/server'

// POST /api/itineraries/[id]/add-destination — tambah destinasi ke itinerary yang sudah ada
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id as string)

  const { id } = await params
  const itineraryId = parseInt(id)

  // Pastikan itinerary milik user
  const itinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId, userId },
    include: { items: true },
  })

  if (!itinerary) return Response.json({ error: 'Itinerary tidak ditemukan' }, { status: 404 })

  const body = await request.json()
  const { destinationId, day } = body

  if (!destinationId) return Response.json({ error: 'destinationId required' }, { status: 400 })

  // Cek duplikat
  const existing = itinerary.items.find((i) => i.destinationId === parseInt(destinationId))
  if (existing) return Response.json({ error: 'Destinasi sudah ada di itinerary ini' }, { status: 409 })

  // Ambil data destinasi
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(destinationId) },
  })
  if (!destination) return Response.json({ error: 'Destinasi tidak ditemukan' }, { status: 404 })

  const targetDay = day || 1
  const orderInDay = itinerary.items.filter((i: any) => i.day === targetDay).length + 1
  const globalOrder = itinerary.items.length + 1

  const newItem = await prisma.itineraryItem.create({
    data: {
      itineraryId,
      destinationId: parseInt(destinationId),
      order: globalOrder,
      estimatedVisitTime: destination.estimatedDuration,
      estimatedCost: destination.ticketPrice,
      transportNote: orderInDay === 1 ? 'Mulai perjalanan dari lokasi Anda' : 'Lanjut menggunakan Grab/Gojek',
    },
  })

  return Response.json({ success: true, item: newItem })
}
