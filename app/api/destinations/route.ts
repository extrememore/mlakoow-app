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

  const limit = parseInt(searchParams.get('limit') || '50')
  const page = parseInt(searchParams.get('page') || '1')
  const skip = (page - 1) * limit
  
  const userLatStr = searchParams.get('userLat')
  const userLngStr = searchParams.get('userLng')
  const userLat = userLatStr ? parseFloat(userLatStr) : null
  const userLng = userLngStr ? parseFloat(userLngStr) : null

  // Helper Haversine
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

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
    const slugs = category.includes(',') ? category.split(',').map(s => s.trim()) : [category]
    // Expand any parent-category slugs to include their children
    const childRows = await prisma.category.findMany({
      where: { parent: { slug: { in: slugs } } },
      select: { slug: true },
    })
    const childSlugs = childRows.map((c) => c.slug)
    const allSlugs = [...new Set([...slugs, ...childSlugs])]
    where.category = { slug: { in: allSlugs } }
  } else if (excludeCategory) {
    if (excludeCategory.includes(',')) {
      where.NOT = { category: { slug: { in: excludeCategory.split(',') } } }
    } else {
      where.NOT = { category: { slug: excludeCategory } }
    }
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
  let orderBy: Prisma.DestinationOrderByWithRelationInput[] | undefined = undefined
  if (sort === 'rating') {
    orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }]
  } else if (sort === 'populer') {
    orderBy = [{ reviewCount: 'desc' }, { rating: 'desc' }]
  } else if (sort === 'harga-murah') {
    orderBy = [{ ticketPrice: 'asc' }, { rating: 'desc' }]
  } else if (sort === 'harga-mahal') {
    orderBy = [{ ticketPrice: 'desc' }, { rating: 'desc' }]
  } else if (sort === 'jarak') {
    // If distance, we will handle sorting in memory
    orderBy = undefined
  } else {
    // Default
    orderBy = [{ featured: 'desc' }, { rating: 'desc' }]
  }

  let destinations: any[] = []
  let total = 0

  if (sort === 'jarak' && userLat !== null && userLng !== null) {
    // Fetch all matching without pagination to sort in memory
    const allMatching = await prisma.destination.findMany({
      where,
      include: { category: true }
    })
    total = allMatching.length
    
    // Add distance and sort
    const withDistance = allMatching.map((d) => ({
      ...d,
      distance: getDistanceFromLatLonInKm(userLat, userLng, d.lat, d.lng)
    }))
    withDistance.sort((a, b) => a.distance - b.distance)
    
    // Paginate manually
    destinations = withDistance.slice(skip, skip + limit)
  } else {
    // Use Prisma for pagination and sorting
    const [fetchedDestinations, count] = await Promise.all([
      prisma.destination.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.destination.count({ where }),
    ])
    
    total = count
    
    // Attach distance if coordinates exist (even if not sorted by distance)
    destinations = fetchedDestinations.map(d => {
      const dist = (userLat !== null && userLng !== null) 
        ? getDistanceFromLatLonInKm(userLat, userLng, d.lat, d.lng) 
        : undefined;
      return { ...d, distance: dist }
    })
  }

  return Response.json({ destinations, total, page, limit })
}
