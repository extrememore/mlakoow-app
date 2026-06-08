import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

// GET /api/wishlist/shared/[token] — tampilkan wishlist publik berdasarkan share token
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const share = await prisma.wishlistShare.findUnique({
    where: { token },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  if (!share) return Response.json({ error: 'Wishlist tidak ditemukan' }, { status: 404 })
  if (!share.isPublic) return Response.json({ error: 'Wishlist ini bersifat privat' }, { status: 403 })

  const items = await prisma.wishlistItem.findMany({
    where: { userId: share.userId },
    include: {
      destination: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({
    owner: share.user,
    items,
    token,
  })
}
