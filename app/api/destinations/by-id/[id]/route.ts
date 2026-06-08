import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

// GET /api/destinations/by-id/[id] — ambil satu destinasi berdasarkan ID numerik
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const destination = await prisma.destination.findUnique({
    where: { id: numId },
    include: { category: true },
  })

  if (!destination) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json(destination)
}
