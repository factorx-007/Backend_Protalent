// src/scripts/seed.js
const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Crear usuario admin por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@protalent.com' },
      update: {},
      create: {
        nombre: 'Administrador',
        email: 'admin@protalent.com',
        password: hashedPassword,
        rol: 'ADMIN',
        perfilCompleto: true
      }
    });

    console.log('✅ Usuario administrador creado:', admin.email);

    // Crear categorías por defecto para el blog
    const categorias = [
      { nombre: 'Tecnología', descripcion: 'Noticias y tendencias tecnológicas' },
      { nombre: 'Carreras', descripcion: 'Información sobre carreras profesionales' },
      { nombre: 'Empresas', descripcion: 'Noticias y artículos sobre empresas' },
      { nombre: 'Estudiantes', descripcion: 'Contenido para estudiantes' },
      { nombre: 'Egresados', descripcion: 'Información para egresados' }
    ];

    for (const categoria of categorias) {
      const existeCategoria = await prisma.categoria.findFirst({
        where: { nombre: categoria.nombre }
      });
      
      if (!existeCategoria) {
        await prisma.categoria.create({
          data: categoria
        });
      }
    }

    console.log('✅ Categorías de blog creadas');
    console.log('🎉 Seeding completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seeding si se llama directamente
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error fatal durante el seeding:', error);
      process.exit(1);
    });
}

module.exports = seed;