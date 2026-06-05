import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dests = await prisma.destination.findMany();
  dests.forEach(d => {
    let hasBrokenGallery = false;
    try {
      const g = JSON.parse(d.gallery);
      if (!Array.isArray(g) || g.length === 0) hasBrokenGallery = true;
    } catch {
      hasBrokenGallery = true;
    }
    
    if (!d.mainImage || d.mainImage.trim() === '' || hasBrokenGallery) {
      console.log(`[Missing/Empty] ID: ${d.id} | Name: ${d.name} | MainImage: ${d.mainImage ? 'Yes' : 'No'} | GalleryEmpty: ${hasBrokenGallery ? 'Yes' : 'No'}`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
