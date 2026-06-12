import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user ? parseInt((session.user as any).id) : null
  const role = (session?.user as any)?.role ?? ''

  if (!userId || role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content } = await request.json()

  const question = await prisma.question.findUnique({
    where: { id: parseInt(id) },
    include: { destination: true }
  })

  if (!question) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  if (question.destination.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const answer = await prisma.answer.create({
    data: {
      content,
      questionId: question.id,
      userId,
    }
  })

  return NextResponse.json(answer)
}
