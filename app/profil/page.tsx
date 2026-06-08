import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export const dynamic = 'force-dynamic'

import Footer from '@/components/layout/Footer'
import LogoutButton from '@/components/ui/LogoutButton'
import { QRModal } from '@/components/ui/QRModal'
import ProfileClient from '@/components/ui/ProfileClient'

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = parseInt(session.user.id as string)

  const [user, itineraries, bookings, reviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.itinerary.findMany({
      where: { userId },
      include: {
        items: {
          include: { destination: { include: { category: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      where: { userId },
      include: { destination: { select: { name: true, mainImage: true, slug: true, area: true, category: { select: { name: true, icon: true, color: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { userId },
      include: { destination: { select: { name: true, slug: true, mainImage: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!user) redirect('/login')

  // Compute aggregates server-side
  const totalSpent = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalPrice, 0)
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  const uniqueAreas = [...new Set(bookings.map(b => b.destination.area))]
  const totalDays = itineraries.reduce((s, i) => s + i.duration, 0)

  // Serialize for client
  const data = {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      itineraryCount: itineraries.length,
      bookingCount: bookings.length,
      reviewCount: reviews.length,
      totalSpent,
      confirmedBookings,
      avgRating,
      uniqueAreas: uniqueAreas.length,
      totalDays,
    },
    itineraries: itineraries.map(i => ({
      id: i.id,
      title: i.title,
      duration: i.duration,
      area: i.area,
      totalEstimatedCost: i.totalEstimatedCost,
      startDate: i.startDate?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
      itemCount: i.items.length,
      items: i.items.slice(0, 4).map(it => ({
        id: it.id,
        destinationName: it.destination.name,
        categoryIcon: it.destination.category.icon,
        categoryColor: it.destination.category.color,
        mainImage: it.destination.mainImage,
      })),
    })),
    bookings: bookings.map(b => ({
      id: b.id,
      bookingCode: b.bookingCode,
      status: b.status,
      visitDate: b.visitDate.toISOString(),
      ticketCount: b.ticketCount,
      totalPrice: b.totalPrice,
      createdAt: b.createdAt.toISOString(),
      destination: {
        name: b.destination.name,
        mainImage: b.destination.mainImage,
        slug: b.destination.slug,
        area: b.destination.area,
        categoryName: b.destination.category?.name ?? '',
        categoryIcon: b.destination.category?.icon ?? '',
        categoryColor: b.destination.category?.color ?? '#0A4A5E',
      },
    })),
    reviews: reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      destination: {
        name: r.destination.name,
        slug: r.destination.slug,
        mainImage: r.destination.mainImage,
      },
    })),
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />
      <ProfileClient data={data} />
      <Footer />
    </div>
  )
}
