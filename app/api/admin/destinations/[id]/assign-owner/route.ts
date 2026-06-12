import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'

// PATCH /api/admin/destinations/[id]/assign-owner
// Body: { email: string } — finds user by email and assigns as owner
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const { id } = await params
  const { email } = await request.json()

  if (!email) return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 })

  const owner = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, role: true } })
  if (!owner) return NextResponse.json({ error: 'User dengan email tersebut tidak ditemukan' }, { status: 404 })
  if (owner.role !== 'owner') return NextResponse.json({ error: 'User harus memiliki role owner terlebih dahulu' }, { status: 400 })

  const destination = await prisma.destination.update({
    where: { id: parseInt(id) },
    data: { ownerId: owner.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ destination, owner })
}

// DELETE — remove owner assignment
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const { id } = await params
  await prisma.destination.update({ where: { id: parseInt(id) }, data: { ownerId: null } })
  return NextResponse.json({ success: true })
}
