// src/scripts/syncPostulacionDb.js
const { sequelize, Postulacion } = require('../models');

async function syncPostulacionDb() {
  try {
    console.log('🔄 Sincronizando modelo Postulacion...');
    
    // Sincronizar solo el modelo Postulacion con alter
    await Postulacion.sync({ alter: true });
    
    console.log('✅ Modelo Postulacion sincronizado exitosamente');
    console.log('📋 Campos agregados:');
    console.log('   - puntuacion (INTEGER, 1-5)');
    console.log('   - recomendacion (ENUM)');
    console.log('   - fechaEvaluacion (DATE)');
    console.log('   - evaluadoPor (INTEGER)');
    
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncPostulacionDb();
}

module.exports = syncPostulacionDb; 