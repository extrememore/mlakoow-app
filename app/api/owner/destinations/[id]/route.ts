import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function checkOwner(destinationId: number) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId || role !== 'owner') return null

  const dest = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { ownerId: true },
  })
  // Owner can only edit their own destinations
  if (dest?.ownerId !== userId) return null
  return { session, userId }
}

// GET a single destination (owner's own)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const destId = parseInt(id)
  const check = await checkOwner(destId)
  if (!check) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const destination = await prisma.destination.findUnique({
    where: { id: destId },
    include: { category: true },
  })
  if (!destination) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(destination)
}

// PATCH — update owner's own destination
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const destId = parseInt(id)
  const check = await checkOwner(destId)
  if (!check) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const ALLOWED = [
    'name', 'slug', 'description', 'categoryId', 'area', 'address',
    'lat', 'lng', 'openHour', 'closeHour', 'ticketPrice', 'mainImage',
    'gallery', 'facilities', 'estimatedDuration', 'menus',
  ]
  const safeData = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)))

  const destination = await prisma.destination.update({
    where: { id: destId },
    data: safeData as any,
    include: { category: true },
  })
  return NextResponse.json(destination)
}
