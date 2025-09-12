// Script para inicializar colecciones de chat en MongoDB
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'plataforma_practicas';

async function init() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    // Crear colecciones si no existen
    await db.createCollection('chats').catch(() => {});
    await db.createCollection('messages').catch(() => {});
    // Índices recomendados
    await db.collection('chats').createIndex({ users: 1 });
    await db.collection('messages').createIndex({ chatId: 1, timestamp: 1 });
    console.log('Colecciones e índices de chat creados correctamente.');
  } finally {
    await client.close();
  }
}

init().catch(console.error); 