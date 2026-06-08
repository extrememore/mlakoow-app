'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized')
  }
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
}

export async function createEvent(data: {
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  image: string
  category: string
  price: string
}) {
  await checkAdmin()
  const slug = generateSlug(data.title)
  
  await prisma.event.create({
    data: {
      ...data,
      slug
    }
  })
  revalidatePath('/extras/kalender-event')
  revalidatePath('/admin/events')
}

export async function updateEvent(id: number, data: {
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  image: string
  category: string
  price: string
}) {
  await checkAdmin()
  
  await prisma.event.update({
    where: { id },
    data
  })
  revalidatePath('/extras/kalender-event')
  revalidatePath('/admin/events')
}

export async function deleteEvent(id: number) {
  await checkAdmin()
  await prisma.event.delete({ where: { id } })
  revalidatePath('/extras/kalender-event')
  revalidatePath('/admin/events')
}
