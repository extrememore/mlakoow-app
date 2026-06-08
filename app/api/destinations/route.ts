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
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')
  const skip = (page - 1) * limit

  const where: Prisma.DestinationWhereInput = {}

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

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.destination.count({ where }),
  ])

  return Response.json({ destinations, total, page, limit })
}
