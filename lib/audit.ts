import { prisma } from './prisma'

export async function logAudit(userId: number, action: string, entity: string, entityId: string, details?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
      }
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
