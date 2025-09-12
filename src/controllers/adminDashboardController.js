const { prisma } = require('../config/database');

// Obtener estadísticas del dashboard de admin
const getDashboardStats = async (req, res) => {
  try {
    console.log('getDashboardStats called - Admin user:', req.adminUser?.nombre);

    // Contar totales
    const [totalUsuarios, totalEmpresas, totalOfertas, totalPostulaciones] = await Promise.all([
      prisma.usuario.count(),
      prisma.empresa.count(),
      prisma.oferta.count(),
      prisma.postulacion.count()
    ]);

    // Obtener últimos 5 usuarios registrados con información de empresa/estudiante si la tienen
    const ultimosUsuarios = await prisma.usuario.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
        empresa: {
          select: {
            nombre_empresa: true,
            descripcion: true
          }
        },
        estudiante: {
          select: {
            carrera: true,
            año_egreso: true
          }
        }
      }
    });

    // Formatear la información de los últimos usuarios
    const usuariosFormateados = ultimosUsuarios.map(usuario => {
      let descripcion = '';
      let tipoUsuario = '';

      if (usuario.rol === 'EMPRESA' && usuario.empresa) {
        tipoUsuario = 'Empresa';
        descripcion = `${usuario.nombre} de ${usuario.empresa.nombre_empresa} se registró como empresa`;
      } else if ((usuario.rol === 'ESTUDIANTE' || usuario.rol === 'EGRESADO') && usuario.estudiante) {
        tipoUsuario = usuario.rol === 'ESTUDIANTE' ? 'Estudiante' : 'Egresado';
        descripcion = `${usuario.nombre} se registró como ${tipoUsuario.toLowerCase()}${usuario.estudiante.carrera ? ` de ${usuario.estudiante.carrera}` : ''}`;
      } else {
        tipoUsuario = usuario.rol === 'EMPRESA' ? 'Empresa' : usuario.rol === 'ESTUDIANTE' ? 'Estudiante' : 'Egresado';
        descripcion = `${usuario.nombre} se registró como ${tipoUsuario.toLowerCase()}`;
      }
      
      return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        tipoUsuario,
        fechaRegistro: usuario.createdAt,
        descripcion
      };
    });

    res.json({
      success: true,
      data: {
        totales: {
          usuarios: totalUsuarios,
          empresas: totalEmpresas,
          ofertas: totalOfertas,
          postulaciones: totalPostulaciones
        },
        ultimosUsuarios: usuariosFormateados
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  getDashboardStats
};
