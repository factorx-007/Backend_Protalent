const { prisma } = require('../config/database');

// Obtener estadísticas del dashboard de empresa
exports.obtenerEstadisticasDashboard = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    // Verificar que el usuario sea una empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { empresa: true }
    });
    
    if (!usuario || usuario.rol !== 'EMPRESA' || !usuario.empresa) {
      return res.status(403).json({ error: 'Acceso denegado. Solo empresas pueden acceder a estas estadísticas.' });
    }
    
    const empresaId = usuario.empresa.id;
    
    // Obtener estadísticas de ofertas
    const [totalOfertas, ofertasActivas] = await Promise.all([
      prisma.oferta.count({
        where: { empresaId }
      }),
      prisma.oferta.count({
        where: { 
          empresaId,
          estado: 'ACTIVA'
        }
      })
    ]);
    
    // Obtener estadísticas de postulaciones
    const [postulacionesTotales, postulacionesNuevas] = await Promise.all([
      prisma.postulacion.count({
        where: {
          oferta: {
            empresaId
          }
        }
      }),
      prisma.postulacion.count({
        where: {
          oferta: {
            empresaId
          },
          estado: 'PENDIENTE'
        }
      })
    ]);
    
    // Calcular tasa de contratación (postulaciones aceptadas vs total)
    const postulacionesAceptadas = await prisma.postulacion.count({
      where: {
        oferta: {
          empresaId
        },
        estado: 'ACEPTADA'
      }
    });
    
    const tasaContratacion = postulacionesTotales > 0 
      ? Math.round((postulacionesAceptadas / postulacionesTotales) * 100) 
      : 0;
    
    // Obtener ofertas recientes con sus postulaciones
    const ofertasRecientes = await prisma.oferta.findMany({
      where: { empresaId },
      include: {
        _count: {
          select: { postulaciones: true }
        },
        ubicacion: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    // Obtener postulaciones por mes (últimos 12 meses)
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 11);
    fechaInicio.setDate(1);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const postulacionesPorMes = await prisma.postulacion.groupBy({
      by: ['createdAt'],
      where: {
        oferta: {
          empresaId
        },
        createdAt: {
          gte: fechaInicio
        }
      },
      _count: {
        id: true
      }
    });
    
    // Procesar datos para el gráfico por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datosPorMes = new Array(12).fill(0);
    
    postulacionesPorMes.forEach(item => {
      const mes = new Date(item.createdAt).getMonth();
      const añoActual = new Date().getFullYear();
      const añoItem = new Date(item.createdAt).getFullYear();
      
      if (añoItem === añoActual) {
        datosPorMes[mes] += item._count.id;
      }
    });
    
    // Obtener postulaciones por cargo/puesto
    const postulacionesPorCargo = await prisma.postulacion.groupBy({
      by: ['oferta'],
      where: {
        oferta: {
          empresaId
        }
      },
      _count: {
        id: true
      }
    });
    
    // Obtener nombres de los cargos
    const cargosConPostulaciones = await Promise.all(
      postulacionesPorCargo.slice(0, 5).map(async (item) => {
        const oferta = await prisma.oferta.findUnique({
          where: { id: item.oferta },
          select: { titulo: true }
        });
        return {
          cargo: oferta?.titulo || 'Sin título',
          postulaciones: item._count.id
        };
      })
    );
    
    res.json({
      estadisticas: {
        totalOfertas,
        ofertasActivas,
        postulacionesTotales,
        postulacionesNuevas,
        tasaContratacion,
        tiempoPromedioContratacion: 14 // Valor fijo por ahora, se puede calcular después
      },
      ofertasRecientes: ofertasRecientes.map(oferta => ({
        id: oferta.id,
        titulo: oferta.titulo,
        ubicacion: oferta.ubicacion?.nombre || 'No especificada',
        tipo: oferta.tipo_contrato || 'No especificado',
        postulaciones: oferta._count.postulaciones,
        estado: oferta.estado,
        createdAt: oferta.createdAt
      })),
      graficos: {
        postulacionesPorMes: {
          labels: meses,
          data: datosPorMes
        },
        postulacionesPorCargo: {
          labels: cargosConPostulaciones.map(item => item.cargo),
          data: cargosConPostulaciones.map(item => item.postulaciones)
        }
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas del dashboard', 
      detalle: error.message 
    });
  }
};

// Obtener resumen de actividad reciente
exports.obtenerActividadReciente = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { empresa: true }
    });
    
    if (!usuario || usuario.rol !== 'EMPRESA' || !usuario.empresa) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const empresaId = usuario.empresa.id;
    
    // Obtener postulaciones recientes
    const postulacionesRecientes = await prisma.postulacion.findMany({
      where: {
        oferta: {
          empresaId
        }
      },
      include: {
        estudiante: {
          include: {
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        },
        oferta: {
          select: {
            titulo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    res.json({
      postulacionesRecientes: postulacionesRecientes.map(postulacion => ({
        id: postulacion.id,
        estudiante: {
          nombre: postulacion.estudiante.usuario.nombre,
          email: postulacion.estudiante.usuario.email,
          carrera: postulacion.estudiante.carrera
        },
        oferta: {
          titulo: postulacion.oferta.titulo
        },
        estado: postulacion.estado,
        fechaPostulacion: postulacion.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({ 
      error: 'Error al obtener actividad reciente', 
      detalle: error.message 
    });
  }
};
