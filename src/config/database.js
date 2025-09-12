// src/config/database.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente con Prisma');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
}

async function disconnectDatabase() {
  await prisma.$disconnect();
}

process.on('beforeExit', async () => {
  await disconnectDatabase();
});

module.exports = { prisma, connectDatabase, disconnectDatabase };