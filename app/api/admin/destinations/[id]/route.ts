import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'

async function checkAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return null
  return session
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  // Whitelist allowed fields — prevent injection of rating, reviewCount, id, etc.
  const ALLOWED_FIELDS = ['name','slug','description','categoryId','area','address','lat','lng','openHour','closeHour','ticketPrice','mainImage','gallery','facilities','estimatedDuration','featured','hiddenGem','menus','wifi','wfc']
  const safeData = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k)))

  const destination = await prisma.destination.update({
    where: { id: parseInt(id) },
    data: safeData,
  })

  return NextResponse.json(destination)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const destId = parseInt(id)

  // Hapus relasi dulu sebelum hapus destinasi
  await prisma.itineraryItem.deleteMany({ where: { destinationId: destId } })
  await prisma.review.deleteMany({ where: { destinationId: destId } })
  await prisma.booking.deleteMany({ where: { destinationId: destId } })
  await prisma.destination.delete({ where: { id: destId } })

  return NextResponse.json({ success: true })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  })

  if (!destination) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(destination)
}
