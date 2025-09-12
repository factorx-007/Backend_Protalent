// src/scripts/createAdmin.js
const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../models');

const createAdminUser = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si el usuario admin ya existe
    const existingAdmin = await Usuario.findOne({ 
      where: { email: 'edwin4chigne@gmail.com' } 
    });

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe con el email edwin4chigne@gmail.com');
      console.log('📄 Datos del usuario existente:');
      console.log({
        id: existingAdmin.id,
        nombre: existingAdmin.nombre,
        email: existingAdmin.email,
        rol: existingAdmin.rol,
        createdAt: existingAdmin.createdAt
      });
      return;
    }

    // Hash de la contraseña
    console.log('🔐 Encriptando contraseña...');
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Crear el usuario admin
    console.log('👤 Creando usuario administrador...');
    const adminUser = await Usuario.create({
      nombre: 'Edwin Admin',
      email: 'edwin4chigne@gmail.com',
      password: hashedPassword,
      rol: 'admin'
    });

    console.log('🎉 ¡Usuario admin creado exitosamente!');
    console.log('📋 Detalles del usuario creado:');
    console.log('━'.repeat(50));
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Nombre: ${adminUser.nombre}`);
    console.log(`🔑 Rol: ${adminUser.rol}`);
    console.log(`🆔 ID: ${adminUser.id}`);
    console.log(`📅 Creado: ${adminUser.createdAt}`);
    console.log('━'.repeat(50));
    console.log('🔓 Credenciales de acceso:');
    console.log(`📧 Email: edwin4chigne@gmail.com`);
    console.log(`🔑 Contraseña: 12345678`);
    console.log('━'.repeat(50));
    console.log('🌐 Accede al panel de admin en: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error al crear el usuario admin:', error.message);
    console.error('📋 Detalles del error:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada.');
  }
};

// Ejecutar la función si el script se ejecuta directamente
if (require.main === module) {
  console.log('🚀 Iniciando script de creación de usuario admin...');
  console.log('━'.repeat(50));
  createAdminUser();
}

module.exports = createAdminUser;
