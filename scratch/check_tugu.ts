import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.destination.findUnique({where:{slug:'tugu-pahlawan'}}).then(res => { 
  console.log('Tugu Pahlawan Gallery:', res.gallery); 
}).finally(() => prisma.$disconnect());
