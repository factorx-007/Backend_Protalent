const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

(async () => {
  try {
    console.log('⏳ Sincronizando modelos con la base de datos...');
    // Cambiado de force: true a alter: true para evitar la pérdida de datos
    await sequelize.sync({ alter: true }); 
    console.log('✅ Modelos sincronizados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    process.exit(1);
  }
})(); 