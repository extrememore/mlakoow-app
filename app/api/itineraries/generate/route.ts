import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Smart itinerary generation — rule-based logic
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { duration, budget, area, areas: inputAreas, categoryIds, maxDestinations } = body

  // Fetch destinations matching criteria
  const where: Record<string, unknown> = {}

  // Multi-area support: prefer `inputAreas` array, fallback to legacy `area` string
  const areaList: string[] = Array.isArray(inputAreas) && inputAreas.length > 0
    ? inputAreas
    : (area && area !== 'Semua Area' ? [area] : [])

  if (areaList.length > 0) where.area = { in: areaList }
  if (categoryIds && categoryIds.length > 0) {
    where.categoryId = { in: categoryIds }
  }

  const allDestinations = await prisma.destination.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
  })

  // Budget filter
  let filtered = allDestinations.filter((d) => {
    if (budget === 0) return true
    return d.ticketPrice <= budget / (maxDestinations || 3)
  })

  // Limit destinations per day
  const destPerDay = Math.min(maxDestinations || 4, 4)
  const totalDest = Math.min(destPerDay * duration, filtered.length, 12)

  // Group by area for efficiency (minimize travel)
  const grouped: Record<string, typeof filtered> = {}
  filtered.forEach((d) => {
    if (!grouped[d.area]) grouped[d.area] = []
    grouped[d.area].push(d)
  })

  // Build ordered itinerary: pick from same area first
  const selected: typeof filtered = []
  const areas = Object.keys(grouped)
  let areaIdx = 0
  while (selected.length < totalDest && filtered.length > 0) {
    const currentArea = areas[areaIdx % areas.length]
    const pool = grouped[currentArea]
    if (pool && pool.length > 0) {
      const pick = pool.shift()!
      selected.push(pick)
      // Remove from filtered
      filtered = filtered.filter((d) => d.id !== pick.id)
    }
    areaIdx++
    if (areaIdx > areas.length * totalDest) break
  }

  // Build itinerary items with time slots
  const items = selected.map((dest, idx) => {
    const dayNumber = Math.floor(idx / destPerDay) + 1
    const slotInDay = idx % destPerDay

    const startHours = [9, 11, 14, 16]
    const startHour = startHours[slotInDay] || 9

    return {
      destination: dest,
      order: idx + 1,
      day: dayNumber,
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      estimatedVisitTime: dest.estimatedDuration,
      estimatedCost: dest.ticketPrice,
      transportNote:
        idx === 0
          ? 'Mulai perjalanan dari lokasi Anda'
          : `Lanjut dari ${selected[idx - 1].name} menggunakan Grab/Gojek`,
    }
  })

  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0)
  const totalTime = items.reduce((sum, item) => sum + item.estimatedVisitTime, 0)

  return Response.json({
    items,
    totalCost,
    totalTime,
    duration,
    summary: {
      destinations: selected.length,
      days: duration,
      estimatedBudget: totalCost,
      areas: [...new Set(selected.map((d) => d.area))],
    },
  })
}
