const { prisma } = require('../config/database');
const { buildPaginationResponse } = require('../utils/prismaHelpers');

// Obtener todas las empresas
const getEmpresas = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    if (search) {
      where.OR = [
        { nombre_empresa: { contains: search, mode: 'insensitive' } },
        { ruc: { contains: search, mode: 'insensitive' } },
        { usuario: { nombre: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              createdAt: true
            }
          },
          _count: {
            select: { ofertas: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip
      }),
      prisma.empresa.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        empresas: empresas.map(empresa => ({
          id: empresa.id,
          nombre: empresa.nombre_empresa,
          ruc: empresa.ruc,
          rubro: empresa.rubro,
          descripcion: empresa.descripcion,
          direccion: empresa.direccion,
          telefono: empresa.telefono,
          logo_url: empresa.logo_url,
          usuario: empresa.usuario,
          totalOfertas: empresa._count.ofertas,
          fechaRegistro: empresa.createdAt,
          createdAt: empresa.createdAt,
          updatedAt: empresa.updatedAt
        })),
        pagination: buildPaginationResponse(empresas, page, limit, total)
      }
    });

  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener empresas'
    });
  }
};

// Obtener todas las ofertas
const getOfertas = async (req, res) => {
  try {
    const { page = 1, limit = 20, empresaId, estado } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    if (empresaId && empresaId !== 'all') {
      where.empresaId = parseInt(empresaId);
    }

    const [ofertas, total] = await Promise.all([
      prisma.oferta.findMany({
        where,
        include: {
          empresa: {
            select: {
              id: true,
              nombre_empresa: true,
              ruc: true
            }
          },
          _count: {
            select: { 
              postulaciones: true,
              requisitos: true,
              preguntas: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip
      }),
      prisma.oferta.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        ofertas: ofertas.map(oferta => ({
          id: oferta.id,
          titulo: oferta.titulo,
          descripcion: oferta.descripcion,
          duracion: oferta.duracion,
          requiereCV: oferta.requiereCV,
          requiereCarta: oferta.requiereCarta,
          empresa: oferta.empresa,
          totalPostulaciones: oferta._count.postulaciones,
          totalRequisitos: oferta._count.requisitos,
          totalPreguntas: oferta._count.preguntas,
          createdAt: oferta.createdAt,
          updatedAt: oferta.updatedAt
        })),
        pagination: buildPaginationResponse(ofertas, page, limit, total)
      }
    });

  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener ofertas'
    });
  }
};

// Obtener todos los estudiantes/egresados
const getEstudiantes = async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo, carrera } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    if (tipo && tipo !== 'all') {
      where.tipo = tipo.toUpperCase();
    }
    if (carrera) {
      where.carrera = { contains: carrera, mode: 'insensitive' };
    }

    const [estudiantes, total] = await Promise.all([
      prisma.estudiante.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true,
              createdAt: true
            }
          },
          _count: {
            select: { postulaciones: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip
      }),
      prisma.estudiante.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        estudiantes: estudiantes.map(estudiante => ({
          id: estudiante.id,
          carrera: estudiante.carrera,
          año_egreso: estudiante.año_egreso,
          telefono: estudiante.telefono,
          tipo: estudiante.tipo,
          cv: estudiante.cv,
          foto_perfil: estudiante.foto_perfil,
          usuario: estudiante.usuario,
          totalPostulaciones: estudiante._count.postulaciones,
          createdAt: estudiante.createdAt,
          updatedAt: estudiante.updatedAt
        })),
        pagination: buildPaginationResponse(estudiantes, page, limit, total)
      }
    });

  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estudiantes'
    });
  }
};

// Obtener todas las postulaciones
const getPostulaciones = async (req, res) => {
  try {
    const { page = 1, limit = 20, estado, ofertaId, estudianteId } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    if (estado && estado !== 'all') {
      where.estado = estado.toUpperCase();
    }
    if (ofertaId && ofertaId !== 'all') {
      where.ofertaId = parseInt(ofertaId);
    }
    if (estudianteId && estudianteId !== 'all') {
      where.estudianteId = parseInt(estudianteId);
    }

    const [postulaciones, total] = await Promise.all([
      prisma.postulacion.findMany({
        where,
        include: {
          estudiante: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  email: true
                }
              }
            }
          },
          oferta: {
            include: {
              empresa: {
                select: {
                  id: true,
                  nombre_empresa: true
                }
              }
            }
          },
          _count: {
            select: { respuestas: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip
      }),
      prisma.postulacion.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        postulaciones: postulaciones.map(postulacion => ({
          id: postulacion.id,
          mensaje: postulacion.mensaje,
          estado: postulacion.estado,
          estudiante: {
            ...postulacion.estudiante,
            usuario: postulacion.estudiante.usuario
          },
          oferta: {
            ...postulacion.oferta,
            empresa: postulacion.oferta.empresa
          },
          totalRespuestas: postulacion._count.respuestas,
          createdAt: postulacion.createdAt,
          updatedAt: postulacion.updatedAt
        })),
        pagination: buildPaginationResponse(postulaciones, page, limit, total)
      }
    });

  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener postulaciones'
    });
  }
};

// Obtener estadísticas generales
const getEstadisticasGenerales = async (req, res) => {
  try {
    const [
      totalUsuarios,
      totalEmpresas,
      totalEstudiantes,
      totalOfertas,
      totalPostulaciones,
      postulacionesPendientes,
      postulacionesAceptadas,
      postulacionesRechazadas
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.empresa.count(),
      prisma.estudiante.count(),
      prisma.oferta.count(),
      prisma.postulacion.count(),
      prisma.postulacion.count({ where: { estado: 'PENDIENTE' } }),
      prisma.postulacion.count({ where: { estado: 'ACEPTADA' } }),
      prisma.postulacion.count({ where: { estado: 'RECHAZADA' } })
    ]);

    // Ofertas más populares (con más postulaciones)
    const ofertasPopulares = await prisma.postulacion.groupBy({
      by: ['ofertaId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Obtener información de las ofertas populares
    const ofertaIds = ofertasPopulares.map(o => o.ofertaId);
    const ofertasInfo = await prisma.oferta.findMany({
      where: { id: { in: ofertaIds } },
      include: {
        empresa: {
          select: {
            nombre_empresa: true
          }
        }
      }
    });

    const ofertasConStats = ofertasPopulares.map(stat => {
      const oferta = ofertasInfo.find(o => o.id === stat.ofertaId);
      return {
        oferta: oferta || { id: stat.ofertaId, titulo: 'Oferta eliminada' },
        totalPostulaciones: stat._count.id
      };
    });

    res.json({
      success: true,
      data: {
        resumen: {
          totalUsuarios,
          totalEmpresas,
          totalEstudiantes,
          totalOfertas,
          totalPostulaciones
        },
        postulaciones: {
          pendientes: postulacionesPendientes,
          aceptadas: postulacionesAceptadas,
          rechazadas: postulacionesRechazadas
        },
        ofertasPopulares: ofertasConStats
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  getEmpresas,
  getOfertas,
  getEstudiantes,
  getPostulaciones,
  getEstadisticasGenerales
};