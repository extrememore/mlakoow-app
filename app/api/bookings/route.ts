import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'MLK-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Login diperlukan untuk booking' }, { status: 401 })
  }

  if ((session.user as any).role === 'owner') {
    return Response.json({ error: 'Owner tidak dapat melakukan pemesanan' }, { status: 403 })
  }

  const { destinationId, visitDate, ticketCount } = await request.json()

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  })

  if (!destination) {
    return Response.json({ error: 'Destinasi tidak ditemukan' }, { status: 404 })
  }

  const totalPrice = destination.ticketPrice * ticketCount

  const booking = await prisma.booking.create({
    data: {
      userId: parseInt(session.user.id as string),
      destinationId,
      visitDate: new Date(visitDate),
      ticketCount,
      totalPrice,
      status: destination.ticketPrice === 0 ? 'confirmed' : 'pending',
      bookingCode: generateBookingCode(),
    },
    include: {
      destination: { select: { name: true, mainImage: true, address: true } },
    },
  })

  return Response.json(booking, { status: 201 })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: parseInt(session.user.id as string) },
    include: {
      destination: { select: { name: true, mainImage: true, address: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(bookings)
}
