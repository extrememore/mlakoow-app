const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const dests = await prisma.destination.findMany({ 
    where: { 
      category: { slug: { in: ['hiburan', 'spot-foto'] } } 
    }, 
    select: { id: true, name: true, address: true, area: true } 
  });
  
  for (const d of dests) {
    let newArea = "Surabaya Pusat"; // default
    const addr = d.address.toLowerCase();
    const name = d.name.toLowerCase();

    if (addr.includes('pakuwon') || addr.includes('ptc') || addr.includes('citraland') || addr.includes('tandes') || addr.includes('lakarsantri') || addr.includes('darmo permai')) {
      newArea = "Surabaya Barat";
    } else if (addr.includes('tunjungan') || addr.includes('pusat') || addr.includes('basuki rahmat')) {
      newArea = "Surabaya Pusat";
    } else if (addr.includes('kenjeran') || addr.includes('sukolilo') || addr.includes('galaxy') || addr.includes('kapas krampung') || addr.includes('mulyorejo')) {
      newArea = "Surabaya Timur";
    } else if (addr.includes('yani') || addr.includes('rungkut') || addr.includes('menanggal') || addr.includes('wonocolo') || addr.includes('royal plaza') || addr.includes('ngagel')) {
      newArea = "Surabaya Selatan";
    }

    await prisma.destination.update({
      where: { id: d.id },
      data: { area: newArea }
    });
  }
  console.log("Area updated");
}

run().finally(() => prisma.$disconnect());
