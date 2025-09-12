const { sequelize } = require('../models');

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...');
    
    // Obtener todas las tablas
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('📋 Tablas encontradas:');
    results.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    // Buscar tablas que contengan "pregunta"
    const preguntaTables = results.filter(row => {
      const tableName = Object.values(row)[0];
      return tableName.toLowerCase().includes('pregunta');
    });
    
    if (preguntaTables.length > 0) {
      console.log('\n🎯 Tablas relacionadas con preguntas:');
      preguntaTables.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`${index + 1}. ${tableName}`);
      });
    } else {
      console.log('\n❌ No se encontraron tablas relacionadas con preguntas');
    }
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkTables();
}

module.exports = checkTables; 