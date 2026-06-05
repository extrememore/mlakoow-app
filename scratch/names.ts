import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.destination.findMany().then(d => {
  d.forEach(x => console.log(x.id, x.name));
  console.log('Total:', d.length);
}).finally(() => prisma.$disconnect());
