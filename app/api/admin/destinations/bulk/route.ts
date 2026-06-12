import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const { action, ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'Tidak ada destinasi yang dipilih' }, { status: 400 })
    }

    if (action === 'delete') {
      await prisma.$transaction([
        prisma.review.deleteMany({ where: { destinationId: { in: ids } } }),
        prisma.itineraryItem.deleteMany({ where: { destinationId: { in: ids } } }),
        prisma.booking.deleteMany({ where: { destinationId: { in: ids } } }),
        prisma.wishlistItem.deleteMany({ where: { destinationId: { in: ids } } }),
        prisma.destination.deleteMany({ where: { id: { in: ids } } }),
      ])

      const session = await auth()
      const userId = parseInt((session?.user as any)?.id || '0')
      await logAudit(userId, 'BULK_DELETE', 'Destination', ids.join(','))

      return Response.json({ success: true, message: `${ids.length} destinasi dihapus` })
    }

    if (action === 'toggleFeatured') {
      // Find all selected destinations to determine their current featured status
      const destinations = await prisma.destination.findMany({
        where: { id: { in: ids } },
        select: { id: true, featured: true }
      })

      // Toggle each destination's featured status using a transaction
      await prisma.$transaction(
        destinations.map(d => 
          prisma.destination.update({
            where: { id: d.id },
            data: { featured: !d.featured }
          })
        )
      )

      const session = await auth()
      const userId = parseInt((session?.user as any)?.id || '0')
      await logAudit(userId, 'BULK_TOGGLE_FEATURED', 'Destination', ids.join(','))

      return Response.json({ success: true, message: `${ids.length} destinasi diperbarui` })
    }

    return Response.json({ error: 'Aksi tidak valid' }, { status: 400 })
  } catch (error: any) {
    console.error('Bulk action error:', error)
    return Response.json({ error: 'Gagal melakukan aksi massal' }, { status: 500 })
  }
}
