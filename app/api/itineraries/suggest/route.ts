import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Smart suggestion API — recommends destinations based on context
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { excludeIds = [], categoryId, area, areas, maxBudget, limit = 5 } = body

  // Resolve area filter: prefer `areas` array, fallback to legacy `area` string
  const areaList: string[] = Array.isArray(areas) && areas.length > 0
    ? areas
    : (area && area !== 'Semua Area' ? [area] : [])

  // Build where clause
  const where: Record<string, unknown> = {}

  // Exclude already-selected destinations
  if (excludeIds.length > 0) {
    where.id = { notIn: excludeIds }
  }

  // Budget filter
  if (maxBudget !== undefined && maxBudget > 0) {
    where.ticketPrice = { lte: maxBudget }
  }

  // Strategy: fetch candidates with priority ordering
  // 1st priority: same category + same area
  // 2nd priority: same category + any area  
  // 3rd priority: same area + any category
  // 4th priority: highest rated fallback

  const candidates = await prisma.destination.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    take: 50, // fetch a broad pool to sort from
  })

  // Score each candidate for relevance
  const scored = candidates.map((dest) => {
    let score = 0
    // Category match: +10
    if (categoryId && dest.categoryId === categoryId) score += 10
    // Area match: +5 if dest is in any of selected areas
    if (areaList.length > 0 && areaList.includes(dest.area)) score += 5
    // Featured bonus: +3
    if (dest.featured) score += 3
    // Rating bonus: +rating
    score += dest.rating
    // Free destination bonus: +1
    if (dest.ticketPrice === 0) score += 1

    return { ...dest, _score: score }
  })

  // Sort by score descending, then take top N
  scored.sort((a, b) => b._score - a._score)
  const results = scored.slice(0, limit)

  // Remove internal scoring field before returning
  const cleaned = results.map(({ _score, ...rest }) => rest)

  return Response.json(cleaned)
}
