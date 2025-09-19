const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/database');

async function createTestUser() {
  try {
    // Crear usuario estudiante de prueba
    const estudianteEmail = 'estudiante@tecsup.edu.pe';
    const estudiantePassword = 'test123';
    const hashedPassword = await bcrypt.hash(estudiantePassword, 10);

    // Verificar si ya existe
    const existeEstudiante = await prisma.usuario.findUnique({
      where: { email: estudianteEmail }
    });

    if (!existeEstudiante) {
      const estudiante = await prisma.usuario.create({
        data: {
          nombre: 'Estudiante Test',
          email: estudianteEmail,
          password: hashedPassword,
          rol: 'ESTUDIANTE',
          perfilCompleto: false
        }
      });

      console.log('✅ Usuario estudiante creado:');
      console.log('Email:', estudianteEmail);
      console.log('Password:', estudiantePassword);
      console.log('ID:', estudiante.id);
    } else {
      console.log('✅ Usuario estudiante ya existe:', estudianteEmail);
    }

    // Crear usuario empresa de prueba
    const empresaEmail = 'empresa@test.com';
    const empresaPassword = 'test123';
    const hashedPasswordEmpresa = await bcrypt.hash(empresaPassword, 10);

    const existeEmpresa = await prisma.usuario.findUnique({
      where: { email: empresaEmail }
    });

    if (!existeEmpresa) {
      const empresa = await prisma.usuario.create({
        data: {
          nombre: 'Empresa Test',
          email: empresaEmail,
          password: hashedPasswordEmpresa,
          rol: 'EMPRESA',
          perfilCompleto: false
        }
      });

      console.log('✅ Usuario empresa creado:');
      console.log('Email:', empresaEmail);
      console.log('Password:', empresaPassword);
      console.log('ID:', empresa.id);
    } else {
      console.log('✅ Usuario empresa ya existe:', empresaEmail);
    }

  } catch (error) {
    console.error('❌ Error al crear usuarios de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestUser();
}

module.exports = createTestUser;
