const { sequelize } = require('../models');

async function addPublicIdColumn() {
  try {
    console.log('🔧 Agregando columna publicId a BlogPostMedia...');
    
    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'BlogPostMedia' 
      AND COLUMN_NAME = 'publicId'
    `);

    if (results.length > 0) {
      console.log('✅ La columna publicId ya existe');
      return;
    }

    // Agregar la columna publicId
    await sequelize.query(`
      ALTER TABLE BlogPostMedia 
      ADD COLUMN publicId VARCHAR(255) NULL 
      AFTER ruta
    `);

    console.log('✅ Columna publicId agregada exitosamente');
    
  } catch (error) {
    console.error('❌ Error al agregar columna publicId:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addPublicIdColumn();
}

module.exports = addPublicIdColumn;
