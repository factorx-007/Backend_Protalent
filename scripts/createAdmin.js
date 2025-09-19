const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/database');

async function createAdmin() {
  try {
    // Verificar si ya existe un admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { rol: 'ADMIN' }
    });

    if (adminExistente) {
      console.log('✅ Ya existe un usuario admin:', adminExistente.email);
      return;
    }

    // Crear usuario admin
    const adminEmail = 'admin@protalent.com';
    const adminPassword = 'admin123'; // Cambiar por una contraseña segura
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        rol: 'ADMIN',
        perfilCompleto: true
      }
    });

    console.log('✅ Usuario admin creado exitosamente:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('ID:', admin.id);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error al crear admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
