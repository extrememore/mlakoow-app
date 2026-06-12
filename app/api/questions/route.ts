import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/questions?destinationId=X
export async function GET(req: NextRequest) {
  const destinationId = parseInt(req.nextUrl.searchParams.get('destinationId') || '0')
  if (!destinationId) return NextResponse.json({ error: 'destinationId required' }, { status: 400 })

  const questions = await prisma.question.findMany({
    where: { destinationId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      answers: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(questions)
}

// POST /api/questions
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { destinationId, content } = await req.json()
  if (!destinationId || !content?.trim()) {
    return NextResponse.json({ error: 'destinationId and content required' }, { status: 400 })
  }

  const question = await prisma.question.create({
    data: {
      userId: parseInt(session.user.id as string),
      destinationId: parseInt(destinationId),
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      answers: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' as const },
      },
    },
  })

  return NextResponse.json(question, { status: 201 })
}
