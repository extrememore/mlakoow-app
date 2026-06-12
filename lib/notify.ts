import { prisma } from './prisma'

export async function createNotification(userId: number, type: string, title: string, message: string, link?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

export async function createAdminNotification(type: string, title: string, message: string, link?: string) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } }
    })
    
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type,
          title,
          message,
          link,
        }))
      })
    }
  } catch (error) {
    console.error('Failed to create admin notification:', error)
  }
}
