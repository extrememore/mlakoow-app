import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { type NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

// GET /api/wishlist — ambil semua wishlist milik user
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id as string)

  const { searchParams } = request.nextUrl
  const checkId = searchParams.get('check')

  // Mode: cek apakah satu destinasi sudah di-wishlist
  if (checkId) {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_destinationId: { userId, destinationId: parseInt(checkId) } },
    })
    return Response.json({ inWishlist: !!item })
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      destination: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Ambil share token user jika ada
  const share = await prisma.wishlistShare.findUnique({ where: { userId } })

  return Response.json({ items, shareToken: share?.token || null, isPublic: share?.isPublic ?? true })
}

// POST /api/wishlist — tambah destinasi ke wishlist
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id as string)

  const body = await request.json()
  const { destinationId, note } = body

  if (!destinationId) return Response.json({ error: 'destinationId required' }, { status: 400 })

  // Upsert: kalau sudah ada, update note. Kalau belum, buat baru.
  const item = await prisma.wishlistItem.upsert({
    where: { userId_destinationId: { userId, destinationId: parseInt(destinationId) } },
    update: { note },
    create: { userId, destinationId: parseInt(destinationId), note },
  })

  return Response.json({ success: true, item })
}

// DELETE /api/wishlist — hapus destinasi dari wishlist
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id as string)

  const { searchParams } = request.nextUrl
  const destinationId = searchParams.get('destinationId')

  if (!destinationId) return Response.json({ error: 'destinationId required' }, { status: 400 })

  await prisma.wishlistItem.deleteMany({
    where: { userId, destinationId: parseInt(destinationId) },
  })

  return Response.json({ success: true })
}

// PATCH /api/wishlist — toggle share / generate token
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id as string)

  const body = await request.json()
  const { action } = body // 'generate_token' | 'toggle_public'

  if (action === 'generate_token') {
    const token = randomBytes(12).toString('hex')
    const share = await prisma.wishlistShare.upsert({
      where: { userId },
      update: { token },
      create: { userId, token },
    })
    return Response.json({ token: share.token })
  }

  if (action === 'toggle_public') {
    const existing = await prisma.wishlistShare.findUnique({ where: { userId } })
    if (!existing) {
      const token = randomBytes(12).toString('hex')
      const share = await prisma.wishlistShare.create({ data: { userId, token, isPublic: true } })
      return Response.json({ token: share.token, isPublic: share.isPublic })
    }
    const updated = await prisma.wishlistShare.update({
      where: { userId },
      data: { isPublic: !existing.isPublic },
    })
    return Response.json({ token: updated.token, isPublic: updated.isPublic })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
