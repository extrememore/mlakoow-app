import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const parentSlug = searchParams.get('parent') || ''

  if (parentSlug) {
    // Return subcategories of a specific parent
    const children = await prisma.category.findMany({
      where: { parent: { slug: parentSlug } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(children)
  }

  // Return full hierarchy: only root categories with their children
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(roots)
}
