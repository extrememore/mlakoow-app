import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const area = searchParams.get('area') || ''
  const featured = searchParams.get('featured') === 'true'
  const hiddenGem = searchParams.get('hiddenGem') === 'true'
  const excludeCategory = searchParams.get('excludeCategory') || ''
  
  // Advanced Filters
  const sort = searchParams.get('sort') || ''
  const price = searchParams.get('price') || ''
  const facilities = searchParams.get('facilities') || ''
  const pageType = searchParams.get('pageType') || 'default'

  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')
  const skip = (page - 1) * limit

  const where: Prisma.DestinationWhereInput = {}
  const andConditions: Prisma.DestinationWhereInput[] = []

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { address: { contains: search } },
    ]
  }

  if (category) {
    where.category = { slug: category }
  } else if (excludeCategory) {
    where.NOT = { category: { slug: excludeCategory } }
  }

  if (area) where.area = area
  if (featured) where.featured = true
  if (hiddenGem) where.hiddenGem = true

  // Price Filter
  if (price === 'gratis') {
    if (pageType !== 'kuliner') {
      where.ticketPrice = 0
    }
  } else if (price === 'murah') {
    where.ticketPrice = { gt: 0, lte: pageType === 'kuliner' ? 25000 : 50000 }
  } else if (price === 'premium') {
    where.ticketPrice = { gt: pageType === 'kuliner' ? 25000 : 50000 }
  }

  // Facilities Filter (AND logic)
  if (facilities) {
    const facilityList = facilities.split(',').map(f => f.trim()).filter(Boolean)
    facilityList.forEach(f => {
      andConditions.push({ facilities: { contains: f } })
    })
  }

  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  // Sorting
  let orderBy: Prisma.DestinationOrderByWithRelationInput[] = []
  if (sort === 'rating') {
    orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }]
  } else if (sort === 'populer') {
    orderBy = [{ reviewCount: 'desc' }, { rating: 'desc' }]
  } else if (sort === 'harga-murah') {
    orderBy = [{ ticketPrice: 'asc' }, { rating: 'desc' }]
  } else if (sort === 'harga-mahal') {
    orderBy = [{ ticketPrice: 'desc' }, { rating: 'desc' }]
  } else {
    // Default
    orderBy = [{ featured: 'desc' }, { rating: 'desc' }]
  }

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.destination.count({ where }),
  ])

  return Response.json({ destinations, total, page, limit })
}
