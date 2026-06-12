import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const destination = await prisma.destination.update({
    where: { id: parseInt(id) },
    data: { status: 'rejected' },
  })
  return NextResponse.json(destination)
}
