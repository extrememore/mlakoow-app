import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { name, avatar, currentPassword, newPassword } = body

    if (!name || name.trim() === '') {
      return new NextResponse('Nama tidak boleh kosong', { status: 400 })
    }

    const dataToUpdate: any = {
      name,
      avatar,
    }

    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return new NextResponse('User not found', { status: 404 })

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return new NextResponse('Password lama tidak sesuai', { status: 400 })
      }

      dataToUpdate.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('[PROFILE_UPDATE_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
