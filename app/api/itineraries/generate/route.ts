import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// --- Utility: Haversine Distance (in km) ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// --- Utility: Time math ---
function addMinutes(timeStr: string, mins: number) {
  const [h, m] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(h, m, 0)
  date.setMinutes(date.getMinutes() + mins)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function parseTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { duration, budget, areas: inputAreas, categoryIds, maxDestinations, pacing, pinnedDestinationIds = [] } = body

  // 1. Determine destPerDay based on pacing
  const destPerDay = pacing === 'santai' ? 3 : pacing === 'padat' ? 5 : 4

  // 2. Fetch Destinations
  const where: any = {}
  const areaList: string[] = Array.isArray(inputAreas) && inputAreas.length > 0 ? inputAreas : []
  
  // We use OR so that pinned destinations are always fetched even if they don't match area filters
  let fetchWhere = {}
  if (pinnedDestinationIds.length > 0) {
    const filterConditions: any = {}
    if (areaList.length > 0) filterConditions.area = { in: areaList }
    if (categoryIds && categoryIds.length > 0) filterConditions.categoryId = { in: categoryIds }
    
    fetchWhere = Object.keys(filterConditions).length > 0 
      ? { OR: [ filterConditions, { id: { in: pinnedDestinationIds } } ] }
      : {}
  } else {
    if (areaList.length > 0) where.area = { in: areaList }
    if (categoryIds && categoryIds.length > 0) where.categoryId = { in: categoryIds }
    fetchWhere = where
  }

  let allDestinations = await prisma.destination.findMany({
    where: fetchWhere,
    include: { category: true },
    orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
  })

  // 3. Filter by budget (average ticket price)
  // We exclude pinned destinations from budget filtering so they don't get accidentally dropped
  allDestinations = allDestinations.filter((d) => {
    if (pinnedDestinationIds.includes(d.id)) return true
    if (budget === 0) return d.ticketPrice === 0
    return d.ticketPrice <= (budget / destPerDay)
  })

  // 4. Day-by-Day Generation
  let pool = [...allDestinations]
  const items: any[] = []
  let globalOrder = 0

  for (let day = 1; day <= duration; day++) {
    const dayItems: any[] = []
    
    // Pick an anchor for the day
    let currentItem = null
    
    // First try to use an unassigned pinned destination as an anchor
    const unassignedPinnedIdx = pool.findIndex(d => pinnedDestinationIds.includes(d.id))
    
    if (unassignedPinnedIdx !== -1) {
      currentItem = pool.splice(unassignedPinnedIdx, 1)[0]
    } else if (pool.length > 0) {
      // Pick highest rated/featured as anchor
      currentItem = pool.shift()
    }

    if (!currentItem) break // No more destinations available

    // Add anchor to day
    let currentTime = '09:00' // Start at 9 AM
    
    // If the anchor opens later than 9 AM, adjust
    if (parseTime(currentItem.openHour) > parseTime(currentTime)) {
      currentTime = currentItem.openHour
    }

    const anchorTimeVal = parseTime(currentTime)
    const anchorRushHour = (anchorTimeVal >= 7 && anchorTimeVal <= 9.5) || (anchorTimeVal >= 16 && anchorTimeVal <= 18.5)

    dayItems.push({
      destination: currentItem,
      order: globalOrder++,
      day: day,
      startTime: currentTime,
      estimatedVisitTime: currentItem.estimatedDuration,
      estimatedCost: currentItem.ticketPrice,
      transportNote: `Mulai perjalanan dari penginapan Anda menggunakan Grab/Gojek ${anchorRushHour ? 'sepeda motor' : 'mobil'}`,
      transportCost: anchorRushHour ? 10000 : 15000 // Base estimate from hotel to first destination
    })

    // Find next destinations for this day using nearest neighbor (Geo-Clustering)
    while (dayItems.length < destPerDay && pool.length > 0) {
      // advance time
      currentTime = addMinutes(currentTime, currentItem!.estimatedDuration + 30) // 30 min travel buffer

      // Find best next destination: shortest distance
      let bestDist = Infinity
      let bestIdx = -1

      for (let i = 0; i < pool.length; i++) {
        const candidate = pool[i]
        const isPinned = pinnedDestinationIds.includes(candidate.id)
        
        // Category Balancing Rule
        const isCafe = candidate.category.slug === 'cafe'
        if (isCafe && parseTime(currentTime) < 12) continue // Cafe normally afternoon/night

        // Check time constraints
        if (parseTime(currentTime) > parseTime(candidate.closeHour)) continue
        
        // Time left before it closes should be at least its estimated duration
        const closeTimeNum = parseTime(candidate.closeHour) === 0 ? 24 : parseTime(candidate.closeHour)
        if (parseTime(currentTime) + (candidate.estimatedDuration / 60) > closeTimeNum) continue

        const dist = getDistance(currentItem!.lat, currentItem!.lng, candidate.lat, candidate.lng)
        
        // Prioritize pinned destinations by giving them a massive distance discount
        const effectiveDist = isPinned ? dist - 10000 : dist

        if (effectiveDist < bestDist) {
          bestDist = effectiveDist
          bestIdx = i
        }
      }

      if (bestIdx !== -1) {
        const nextDest = pool[bestIdx]
        pool.splice(bestIdx, 1) // Remove from pool

        // Adjust time if we arrive before it opens
        if (parseTime(currentTime) < parseTime(nextDest.openHour)) {
          currentTime = nextDest.openHour
        }

        const actualDist = getDistance(currentItem!.lat, currentItem!.lng, nextDest.lat, nextDest.lng)
        
        const timeVal = parseTime(currentTime)
        const isRushHour = (timeVal >= 7 && timeVal <= 9.5) || (timeVal >= 16 && timeVal <= 18.5)
        
        let transportMode = isRushHour ? 'sepeda motor (hindari macet)' : 'mobil (lebih adem)'
        let baseFare = isRushHour ? 10000 : 15000
        let perKmFare = isRushHour ? 2500 : 4000
        
        let transportNote = `Lanjut sekitar ${Math.round(actualDist * 10) / 10} km menggunakan Grab/Gojek ${transportMode}`
        let transportCost = baseFare + Math.round(Math.max(0, actualDist - 2) * perKmFare)
        
        dayItems.push({
          destination: nextDest,
          order: globalOrder++,
          day: day,
          startTime: currentTime,
          estimatedVisitTime: nextDest.estimatedDuration,
          estimatedCost: nextDest.ticketPrice,
          transportNote: transportNote,
          transportCost: transportCost
        })
        
        currentItem = nextDest
      } else {
        // No valid destination found for remaining time/constraints today
        break
      }
    }
    
    items.push(...dayItems)
  }

  // Calculate totals
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0)
  const totalTransportCost = items.reduce((sum, item) => sum + item.transportCost, 0)
  const totalTime = items.reduce((sum, item) => sum + item.estimatedVisitTime, 0)
  const uniqueAreas = [...new Set(items.map((i) => i.destination.area))]

  return Response.json({
    items,
    totalCost,
    totalTransportCost,
    totalTime,
    duration,
    summary: {
      destinations: items.length,
      days: duration,
      estimatedBudget: totalCost,
      estimatedTransportCost: totalTransportCost,
      areas: uniqueAreas,
    },
  })
}
