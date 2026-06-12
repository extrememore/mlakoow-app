import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/questions/[id]/answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const questionId = parseInt(id)
  if (isNaN(questionId)) return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 })

  // Check question exists
  const question = await prisma.question.findUnique({ where: { id: questionId } })
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  const answer = await prisma.answer.create({
    data: {
      userId: parseInt(session.user.id as string),
      questionId,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  return NextResponse.json(answer, { status: 201 })
}
