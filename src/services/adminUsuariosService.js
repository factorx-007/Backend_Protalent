// src/services/adminUsuariosService.js - Lógica de negocio para gestión de usuarios admin
const { prisma } = require('../config/database');
const { buildPaginationResponse, buildSearchFilter } = require('../utils/prismaHelpers');

class AdminUsuariosService {
  // Obtener usuarios con filtros y paginación
  async obtenerUsuarios(filtros = {}) {
    const { 
      page = 1, 
      limit = 10, 
      rol, 
      search,
      orderBy = 'createdAt',
      order = 'desc'
    } = filtros;

    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where = {};
    
    if (rol && rol !== 'all') {
      where.rol = rol.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener usuarios con sus relaciones
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          googleId: true,
          perfilCompleto: true,
          createdAt: true,
          updatedAt: true,
          empresa: {
            select: {
              id: true,
              nombre_empresa: true,
              ruc: true,
              rubro: true,
              descripcion: true
            }
          },
          estudiante: {
            select: {
              id: true,
              carrera: true,
              año_egreso: true,
              tipo: true,
              telefono: true
            }
          }
        },
        orderBy: { [orderBy]: order },
        take: parseInt(limit),
        skip: parseInt(skip)
      }),
      prisma.usuario.count({ where })
    ]);

    // Formatear respuesta
    const usuariosFormateados = usuarios.map(usuario => ({
      ...usuario,
      tipoUsuario: this.determinarTipoUsuario(usuario),
      perfilEspecifico: usuario.empresa || usuario.estudiante || null
    }));

    return {
      usuarios: usuariosFormateados,
      pagination: buildPaginationResponse(usuarios, page, limit, total)
    };
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        googleId: true,
        perfilCompleto: true,
        createdAt: true,
        updatedAt: true,
        empresa: {
          select: {
            id: true,
            ruc: true,
            nombre_empresa: true,
            rubro: true,
            descripcion: true,
            direccion: true,
            telefono: true,
            logo_url: true,
            _count: {
              select: { ofertas: true }
            }
          }
        },
        estudiante: {
          select: {
            id: true,
            carrera: true,
            año_egreso: true,
            telefono: true,
            tipo: true,
            cv: true,
            foto_perfil: true,
            _count: {
              select: { postulaciones: true }
            }
          }
        }
      }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return {
      ...usuario,
      tipoUsuario: this.determinarTipoUsuario(usuario),
      estadisticas: this.construirEstadisticasUsuario(usuario)
    };
  }

  // Eliminar usuario
  async eliminarUsuario(id) {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, rol: true, nombre: true }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // No permitir eliminar admins (medida de seguridad)
    if (usuario.rol === 'ADMIN') {
      throw new Error('No se puede eliminar usuarios administradores');
    }

    // Eliminar usuario (las relaciones se eliminan en cascada)
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });

    return { mensaje: `Usuario ${usuario.nombre} eliminado exitosamente` };
  }

  // Obtener estadísticas de usuarios
  async obtenerEstadisticas() {
    const [
      totalUsuarios,
      totalEmpresas,
      totalEstudiantes,
      totalEgresados,
      totalAdmins,
      usuariosRecientes,
      usuariosConGoogle
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { rol: 'EMPRESA' } }),
      prisma.usuario.count({ where: { rol: 'ESTUDIANTE' } }),
      prisma.usuario.count({ where: { rol: 'EGRESADO' } }),
      prisma.usuario.count({ where: { rol: 'ADMIN' } }),
      prisma.usuario.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          createdAt: true
        }
      }),
      prisma.usuario.count({ where: { googleId: { not: null } } })
    ]);

    return {
      resumen: {
        totalUsuarios,
        totalEmpresas,
        totalEstudiantes,
        totalEgresados,
        totalAdmins,
        usuariosConGoogle
      },
      usuariosRecientes
    };
  }

  // Buscar usuarios
  async buscarUsuarios(termino, limite = 20) {
    if (!termino || termino.trim().length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }

    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: { not: 'ADMIN' },
        OR: [
          { nombre: { contains: termino.trim(), mode: 'insensitive' } },
          { email: { contains: termino.trim(), mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
      },
      orderBy: { nombre: 'asc' },
      take: parseInt(limite)
    });

    return {
      usuarios,
      total: usuarios.length,
      terminoBusqueda: termino.trim()
    };
  }

  // Cambiar rol de usuario
  async cambiarRol(id, nuevoRol) {
    const rolesValidos = ['ESTUDIANTE', 'EGRESADO', 'EMPRESA'];
    
    if (!rolesValidos.includes(nuevoRol.toUpperCase())) {
      throw new Error('Rol no válido');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.rol === 'ADMIN') {
      throw new Error('No se puede cambiar el rol de un administrador');
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { 
        rol: nuevoRol.toUpperCase(),
        perfilCompleto: false // Requerir completar perfil con nuevo rol
      }
    });

    return usuarioActualizado;
  }

  // Métodos auxiliares
  determinarTipoUsuario(usuario) {
    if (usuario.empresa) return 'Empresa';
    if (usuario.estudiante) {
      return usuario.estudiante.tipo === 'EGRESADO' ? 'Egresado' : 'Estudiante';
    }
    return usuario.rol.toLowerCase();
  }

  construirEstadisticasUsuario(usuario) {
    const stats = {
      perfilCompleto: usuario.perfilCompleto,
      tieneGoogle: !!usuario.googleId,
      fechaRegistro: usuario.createdAt
    };

    if (usuario.empresa) {
      stats.totalOfertas = usuario.empresa._count?.ofertas || 0;
    }

    if (usuario.estudiante) {
      stats.totalPostulaciones = usuario.estudiante._count?.postulaciones || 0;
    }

    return stats;
  }
}

module.exports = new AdminUsuariosService();