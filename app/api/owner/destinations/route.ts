import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminNotification } from '@/lib/notify'

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId || role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const destinations = await prisma.destination.findMany({
    where: { ownerId: userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(destinations)
}

export async function POST(request: Request) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId || role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const ALLOWED = ['name','slug','description','categoryId','area','address','lat','lng','openHour','closeHour','ticketPrice','mainImage','gallery','facilities','estimatedDuration','menus']
  const safeData = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)))

  const destination = await prisma.destination.create({
    data: {
      ...safeData,
      status: 'pending',
      ownerId: userId,
      gallery: safeData.gallery || '[]',
      facilities: safeData.facilities || '[]',
    } as any,
  })

  await createAdminNotification(
    'WARNING',
    'Destinasi Baru Menunggu Approval',
    `Owner telah menambahkan destinasi "${safeData.name}" dan menunggu review.`,
    '/admin/approval'
  )

  return NextResponse.json(destination, { status: 201 })
}
