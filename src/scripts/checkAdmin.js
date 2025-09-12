// src/scripts/checkAdmin.js
const { sequelize, Usuario } = require('../models');

const checkAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Buscar el usuario admin
    const adminUser = await Usuario.findOne({ 
      where: { email: 'edwin4chigne@gmail.com' } 
    });

    if (adminUser) {
      console.log('✅ Usuario admin encontrado:');
      console.log({
        id: adminUser.id,
        nombre: adminUser.nombre,
        email: adminUser.email,
        rol: adminUser.rol,
        tienePassword: !!adminUser.password,
        password: adminUser.password ? '[EXISTE]' : '[NO EXISTE]'
      });
    } else {
      console.log('❌ Usuario admin NO encontrado');
    }

    // Listar todos los usuarios admin
    const allAdmins = await Usuario.findAll({ 
      where: { rol: 'admin' },
      attributes: ['id', 'nombre', 'email', 'rol', 'password']
    });

    console.log('\n📋 Todos los usuarios admin:');
    allAdmins.forEach(admin => {
      console.log({
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        tienePassword: !!admin.password
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Detalles:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
};

if (require.main === module) {
  checkAdmin();
}

module.exports = checkAdmin;
