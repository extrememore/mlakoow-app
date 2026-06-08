const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const foodImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop', // Salad bowl
  'https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=400&auto=format&fit=crop', // Burger
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', // Pizza slice
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop', // Chicken skewers
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop', // Roast meat
  'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=400&auto=format&fit=crop', // Pasta
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop', // Veggies
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop', // Pasta top
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=400&auto=format&fit=crop', // Sandwich
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop', // Spread
];

const drinkImages = [
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop', // Drink
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop', // Cocktail
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop', // Coffee
  'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=400&auto=format&fit=crop', // Iced tea
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  const kulinerDests = await prisma.destination.findMany({
    where: { category: { slug: 'kuliner' } }
  });

  for (const dest of kulinerDests) {
    if (!dest.menus) continue;
    let menus = JSON.parse(dest.menus);
    
    menus = menus.map(m => {
      const isDrink = m.name.toLowerCase().includes('minum') || m.name.toLowerCase().includes('es') || m.name.toLowerCase().includes('kopi') || m.name.toLowerCase().includes('jus');
      return {
        ...m,
        image: m.image || (isDrink ? getRandomItem(drinkImages) : getRandomItem(foodImages))
      };
    });

    await prisma.destination.update({
      where: { id: dest.id },
      data: { menus: JSON.stringify(menus) }
    });
  }

  console.log('Updated menu images successfully!');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
