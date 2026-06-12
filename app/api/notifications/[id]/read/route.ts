import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership
  const notif = await prisma.notification.findUnique({ where: { id: parseInt(id) } })
  if (!notif || notif.userId !== userId) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  const updated = await prisma.notification.update({
    where: { id: parseInt(id) },
    data: { isRead: true }
  })

  return NextResponse.json(updated)
}
