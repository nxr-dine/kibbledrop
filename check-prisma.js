// Quick test to check if Prisma Trade model is available
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('Available Prisma models:');
console.log(Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')));

// Check if trade model exists
if (prisma.trade) {
  console.log('✅ Trade model is available');
} else {
  console.log('❌ Trade model is NOT available');
}

prisma.$disconnect();
