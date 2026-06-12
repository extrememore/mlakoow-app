import { prisma } from '../lib/prisma'

async function main() {
  const result = await prisma.user.updateMany({
    where: { role: 'admin' },
    data: { role: 'superadmin' },
  })
  console.log(`✅ Migrated ${result.count} admin(s) → superadmin`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
