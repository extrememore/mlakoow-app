import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    const id = parseInt(p.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!destination) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(destination)
  } catch (error) {
    console.error('Failed to fetch destination:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
