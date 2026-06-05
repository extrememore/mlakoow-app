import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dests = await prisma.destination.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(dests, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
