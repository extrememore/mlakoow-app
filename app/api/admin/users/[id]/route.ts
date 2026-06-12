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

// PATCH /api/admin/users/[id] — toggle role or update user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await request.json()

  // Only allow role changes (whitelist)
  const ALLOWED = ['role']
  const safeData = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)))

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: safeData,
    select: { id: true, name: true, email: true, role: true },
  })
  return NextResponse.json(user)
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const userId = parseInt(id)

  // Cascade: delete user data first
  await prisma.itineraryItem.deleteMany({ where: { itinerary: { userId } } })
  await prisma.itinerary.deleteMany({ where: { userId } })
  await prisma.booking.deleteMany({ where: { userId } })
  await prisma.review.deleteMany({ where: { userId } })
  await prisma.answer.deleteMany({ where: { userId } })
  await prisma.question.deleteMany({ where: { userId } })
  await prisma.wishlistItem.deleteMany({ where: { userId } })
  await prisma.wishlistShare.deleteMany({ where: { userId } })
  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
