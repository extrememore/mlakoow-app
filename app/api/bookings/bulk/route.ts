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

// Bulk booking — book multiple destinations at once (from itinerary)
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Login diperlukan untuk booking' }, { status: 401 })
  }

  const { items } = await request.json()
  // items: Array<{ destinationId: number, visitDate: string, ticketCount: number }>

  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Tidak ada item booking' }, { status: 400 })
  }

  const userId = parseInt(session.user.id as string)
  const bookings = []

  for (const item of items) {
    const destination = await prisma.destination.findUnique({
      where: { id: item.destinationId },
      select: { id: true, name: true, ticketPrice: true, mainImage: true, address: true },
    })

    if (!destination) continue
    // Skip free destinations
    if (destination.ticketPrice === 0) continue

    const totalPrice = destination.ticketPrice * item.ticketCount

    const booking = await prisma.booking.create({
      data: {
        userId,
        destinationId: destination.id,
        visitDate: new Date(item.visitDate),
        ticketCount: item.ticketCount,
        totalPrice,
        status: 'confirmed',
        bookingCode: generateBookingCode(),
      },
    })

    bookings.push({
      bookingCode: booking.bookingCode,
      destinationId: destination.id,
      destinationName: destination.name,
      visitDate: item.visitDate,
      ticketCount: item.ticketCount,
      ticketPrice: destination.ticketPrice,
      totalPrice,
    })
  }

  const grandTotal = bookings.reduce((sum, b) => sum + b.totalPrice, 0)

  return Response.json({
    bookings,
    grandTotal,
    count: bookings.length,
  }, { status: 201 })
}
