// src/services/adminComentariosService.js - Lógica de negocio para gestión de comentarios
const { prisma } = require('../config/database');
const { buildPaginationResponse } = require('../utils/prismaHelpers');

class AdminComentariosService {
  // Obtener comentarios con filtros
  async obtenerComentarios(filtros = {}) {
    const { 
      page = 1, 
      limit = 20, 
      blogPostId, 
      buscar,
      estado = 'all' // pendiente, aprobado, rechazado
    } = filtros;

    const skip = (page - 1) * limit;

    // Construir filtros
    const whereConditions = {};
    
    if (blogPostId && blogPostId !== 'all') {
      whereConditions.blogPostId = parseInt(blogPostId);
    }
    
    if (buscar) {
      whereConditions.OR = [
        { contenido: { contains: buscar, mode: 'insensitive' } },
        { autor: { contains: buscar, mode: 'insensitive' } },
        { email: { contains: buscar, mode: 'insensitive' } }
      ];
    }

    // Obtener comentarios y total
    const [comentarios, total] = await Promise.all([
      prisma.comentario.findMany({
        where: whereConditions,
        include: {
          blogPost: {
            select: {
              id: true,
              titulo: true
            }
          },
          respuestas: {
            select: {
              id: true,
              contenido: true,
              autor: true,
              createdAt: true
            },
            orderBy: { createdAt: 'asc' },
            take: 3 // Solo mostrar primeras 3 respuestas en lista
          },
          medias: {
            select: {
              id: true,
              url: true,
              tipo: true
            }
          },
          _count: {
            select: { 
              respuestas: true,
              reacciones: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip
      }),
      prisma.comentario.count({ where: whereConditions })
    ]);

    // Formatear comentarios
    const comentariosFormateados = comentarios.map(comentario => ({
      id: comentario.id,
      contenido: comentario.contenido,
      autor: {
        nombre: comentario.autor || 'Usuario Anónimo',
        email: comentario.email || 'Sin email',
        tipo: 'usuario'
      },
      blogPost: comentario.blogPost,
      respuestas: comentario.respuestas,
      medias: comentario.medias,
      estadisticas: {
        totalRespuestas: comentario._count.respuestas,
        totalReacciones: comentario._count.reacciones
      },
      createdAt: comentario.createdAt,
      updatedAt: comentario.updatedAt
    }));

    return {
      comentarios: comentariosFormateados,
      pagination: buildPaginationResponse(comentarios, page, limit, total)
    };
  }

  // Obtener comentario por ID con detalles completos
  async obtenerComentarioPorId(id) {
    const comentario = await prisma.comentario.findUnique({
      where: { id: parseInt(id) },
      include: {
        blogPost: {
          select: {
            id: true,
            titulo: true,
            contenido: true
          }
        },
        padre: {
          select: {
            id: true,
            contenido: true,
            autor: true
          }
        },
        respuestas: {
          select: {
            id: true,
            contenido: true,
            autor: true,
            email: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        },
        medias: true,
        reacciones: {
          select: {
            id: true,
            tipo: true,
            usuarioId: true,
            createdAt: true
          }
        }
      }
    });

    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }

    return {
      ...comentario,
      autor: {
        nombre: comentario.autor || 'Usuario Anónimo',
        email: comentario.email || 'Sin email',
        tipo: 'usuario'
      },
      estadisticas: {
        totalRespuestas: comentario.respuestas.length,
        totalReacciones: comentario.reacciones.length,
        reaccionesPorTipo: this.contarReaccionesPorTipo(comentario.reacciones)
      }
    };
  }

  // Eliminar comentario
  async eliminarComentario(id) {
    const comentario = await prisma.comentario.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, autor: true }
    });

    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }

    // Eliminar comentario (las respuestas y reacciones se eliminan en cascada)
    await prisma.comentario.delete({
      where: { id: parseInt(id) }
    });

    return { 
      mensaje: `Comentario de ${comentario.autor || 'Usuario Anónimo'} eliminado exitosamente` 
    };
  }

  // Eliminar múltiples comentarios
  async eliminarComentariosEnLote(ids) {
    const idsNumericos = ids.map(id => parseInt(id));
    
    const comentarios = await prisma.comentario.findMany({
      where: { id: { in: idsNumericos } },
      select: { id: true }
    });

    if (comentarios.length === 0) {
      throw new Error('No se encontraron comentarios para eliminar');
    }

    await prisma.comentario.deleteMany({
      where: { id: { in: idsNumericos } }
    });

    return { 
      mensaje: `${comentarios.length} comentarios eliminados exitosamente` 
    };
  }

  // Obtener estadísticas de comentarios
  async obtenerEstadisticas() {
    const [
      totalComentarios,
      comentariosHoy,
      comentariosEstesMes
    ] = await Promise.all([
      prisma.comentario.count(),
      prisma.comentario.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.comentario.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    // Comentarios por blog post (top 10)
    const comentariosPorPost = await this.obtenerComentariosPorBlogPost();
    
    // Comentarios recientes
    const comentariosRecientes = await prisma.comentario.findMany({
      include: {
        blogPost: {
          select: {
            id: true,
            titulo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      resumen: {
        totalComentarios,
        comentariosHoy,
        comentariosEstesMes
      },
      comentariosPorPost,
      comentariosRecientes: comentariosRecientes.map(comentario => ({
        ...comentario,
        autor: {
          nombre: comentario.autor || 'Usuario Anónimo',
          email: comentario.email || 'Sin email'
        }
      }))
    };
  }

  // Obtener comentarios por blog post
  async obtenerComentariosPorBlogPost(limite = 10) {
    const stats = await prisma.comentario.groupBy({
      by: ['blogPostId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limite
    });

    // Obtener información de los blog posts
    const blogPostIds = stats.map(item => item.blogPostId).filter(Boolean);
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        id: { in: blogPostIds }
      },
      select: {
        id: true,
        titulo: true
      }
    });

    // Combinar datos
    return stats.map(stat => {
      const blogPost = blogPosts.find(bp => bp.id === stat.blogPostId);
      return {
        blogPost: blogPost || { id: stat.blogPostId, titulo: 'Post eliminado' },
        totalComentarios: stat._count.id
      };
    });
  }

  // Filtrar comentarios por palabras ofensivas (funcionalidad futura)
  async filtrarComentariosOfensivos() {
    // Lista básica de palabras para filtrar
    const palabrasOfensivas = ['spam', 'odio', 'insulto']; // Expandir según necesidades
    
    const comentariosSospechosos = await prisma.comentario.findMany({
      where: {
        OR: palabrasOfensivas.map(palabra => ({
          contenido: {
            contains: palabra,
            mode: 'insensitive'
          }
        }))
      },
      include: {
        blogPost: {
          select: { id: true, titulo: true }
        }
      },
      take: 50
    });

    return comentariosSospechosos.map(comentario => ({
      ...comentario,
      autor: {
        nombre: comentario.autor || 'Usuario Anónimo',
        email: comentario.email || 'Sin email'
      }
    }));
  }

  // Métodos auxiliares
  contarReaccionesPorTipo(reacciones) {
    const conteo = {};
    reacciones.forEach(reaccion => {
      conteo[reaccion.tipo] = (conteo[reaccion.tipo] || 0) + 1;
    });
    return conteo;
  }
}

module.exports = new AdminComentariosService();