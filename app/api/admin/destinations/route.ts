import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') return null
  return session
}

// POST - tambah destinasi baru
export async function POST(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const {
    name, slug, description, categoryId, area, address,
    lat, lng, openHour, closeHour, ticketPrice, mainImage,
    gallery, estimatedDuration, facilities, featured, hiddenGem,
  } = body

  const destination = await prisma.destination.create({
    data: {
      name, slug, description, categoryId: parseInt(categoryId),
      area, address, lat: parseFloat(lat), lng: parseFloat(lng),
      openHour, closeHour, ticketPrice: parseInt(ticketPrice) || 0,
      mainImage, gallery: gallery || '[]',
      estimatedDuration: parseInt(estimatedDuration) || 60,
      facilities: facilities || '[]',
      featured: featured || false,
      hiddenGem: hiddenGem || false,
    },
    include: { category: true },
  })

  return NextResponse.json(destination, { status: 201 })
}
