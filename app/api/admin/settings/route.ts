import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/roles'
import { logAudit } from '@/lib/audit'

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await prisma.siteSetting.findMany()
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>)

  return NextResponse.json(settingsMap)
}

export async function POST(request: Request) {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId || !isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  // Iterate over object keys and upsert
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    }
  }

  await logAudit(userId, 'UPDATE_SETTINGS', 'SiteSetting', 'global', body)

  return NextResponse.json({ success: true })
}
