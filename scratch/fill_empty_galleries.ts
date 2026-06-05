import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const genericImages = [
  'https://images.unsplash.com/photo-1555217851-6141535bd771?w=600&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
  'https://images.unsplash.com/photo-1561495376-dc9c7c5b8726?w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef47?w=600&q=80'
];

async function main() {
  const dests = await prisma.destination.findMany();
  let updatedCount = 0;

  for (const dest of dests) {
    if (!dest.gallery || dest.gallery === '[]' || dest.gallery === '') {
      // Pick 3 random images for the gallery
      const shuffled = [...genericImages].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      await prisma.destination.update({
        where: { id: dest.id },
        data: { gallery: JSON.stringify(selected) }
      });
      console.log(`Updated gallery for ${dest.name}`);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} destinations with empty galleries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
