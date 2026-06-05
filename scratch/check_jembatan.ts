import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.destination.findUnique({where:{slug:'jembatan-merah-surabaya'}}).then(res => { 
  console.log('Jembatan Merah Gallery:', res.gallery); 
}).finally(() => prisma.$disconnect());
