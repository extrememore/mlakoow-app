import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const { id } = await params
  const destination = await prisma.destination.update({
    where: { id: parseInt(id) },
    data: { status: 'published' },
    include: { owner: { select: { name: true, email: true } } },
  })
  return NextResponse.json(destination)
}
