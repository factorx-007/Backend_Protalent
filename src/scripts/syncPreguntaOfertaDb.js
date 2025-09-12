const { sequelize, PreguntaOferta } = require('../models');

async function syncPreguntaOfertaDb() {
  try {
    console.log('🔄 Sincronizando modelo PreguntaOferta...');
    
    // Sincronizar el modelo
    await PreguntaOferta.sync({ alter: true });
    
    console.log('✅ Modelo PreguntaOferta sincronizado exitosamente');
    
    // Verificar que los campos existen
    const tableInfo = await sequelize.getQueryInterface().describeTable('PreguntaOferta');
    console.log('📋 Campos actuales de la tabla PreguntaOferta:');
    console.log(Object.keys(tableInfo));
    
    // Mostrar información del campo tipo
    if (tableInfo.tipo) {
      console.log('📝 Campo tipo:', tableInfo.tipo);
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando PreguntaOferta:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncPreguntaOfertaDb();
}

module.exports = syncPreguntaOfertaDb; 