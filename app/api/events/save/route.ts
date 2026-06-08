import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id as string)
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const existing = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    })

    if (existing) {
      await prisma.savedEvent.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ saved: false })
    } else {
      await prisma.savedEvent.create({
        data: {
          userId,
          eventId
        }
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('Error saving event:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
