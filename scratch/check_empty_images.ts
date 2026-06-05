import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dests = await prisma.destination.findMany();
  const emptyImages = dests.filter(d => !d.mainImage || d.mainImage.trim() === '' || !d.mainImage.startsWith('http'));
  console.log('Total destinations missing image:', emptyImages.length);
  console.log(JSON.stringify(emptyImages, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
