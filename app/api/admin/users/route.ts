import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin, isSuperAdmin } from '@/lib/roles'
import bcrypt from 'bcryptjs'

async function checkAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role ?? ''
  if (!session?.user || !isAdmin(role)) return null
  return session
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { bookings: true, reviews: true, itineraries: true, ownedDestinations: true } },
    },
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const callerRole = (session.user as any)?.role ?? ''
  const body = await request.json()
  const { name, email, password, role } = body

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  // Only superadmin can create admin/superadmin
  if ((role === 'admin' || role === 'superadmin') && !isSuperAdmin(callerRole)) {
    return NextResponse.json({ error: 'Hanya superadmin yang dapat membuat akun admin' }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
