const { Usuario, Empresa, Estudiante } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Obtener todos los usuarios con paginación y filtros
const getUsuarios = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      rol, 
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir filtros
    const where = {};
    if (rol && rol !== 'all') {
      where.rol = rol;
    }
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Obtener usuarios con sus relaciones
    const { count, rows: usuarios } = await Usuario.findAndCountAll({
      where,
      include: [
        {
          model: Empresa,
          required: false,
          attributes: ['nombreEmpresa', 'descripcion']
        },
        {
          model: Estudiante,
          required: false,
          attributes: ['carrera', 'anioIngreso']
        }
      ],
      attributes: ['id', 'nombre', 'email', 'rol', 'googleId', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Formatear los datos
    const usuariosFormateados = usuarios.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      tieneGoogle: !!usuario.googleId,
      empresa: usuario.Empresa ? {
        nombre: usuario.Empresa.nombreEmpresa,
        descripcion: usuario.Empresa.descripcion
      } : null,
      estudiante: usuario.Estudiante ? {
        carrera: usuario.Estudiante.carrera,
        anioIngreso: usuario.Estudiante.anioIngreso
      } : null,
      fechaRegistro: usuario.createdAt,
      fechaActualizacion: usuario.updatedAt
    }));

    res.json({
      success: true,
      data: {
        usuarios: usuariosFormateados,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener usuarios'
    });
  }
};

// Crear un nuevo usuario admin
const createAdmin = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar que el email no exista
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este email'
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario admin
    const nuevoAdmin = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'admin'
    });

    res.status(201).json({
      success: true,
      data: {
        id: nuevoAdmin.id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol,
        fechaRegistro: nuevoAdmin.createdAt
      },
      message: 'Administrador creado exitosamente'
    });

  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear administrador'
    });
  }
};

// Actualizar un usuario (solo admins)
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro usuario con este email'
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email;
    if (rol) updateData.rol = rol;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await usuario.update(updateData);

    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fechaActualizacion: usuario.updatedAt
      },
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar usuario'
    });
  }
};

// Eliminar un usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar al admin que está haciendo la request
    if (usuario.id === req.adminUser.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    await usuario.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar usuario'
    });
  }
};

// Obtener estadísticas de usuarios
const getUsuariosStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Usuario.count({ where: { rol: 'estudiante' } }),
      Usuario.count({ where: { rol: 'empresa' } }),
      Usuario.count({ where: { rol: 'admin' } }),
      Usuario.count({ where: { rol: 'egresado' } }),
      Usuario.count({ where: { googleId: { [Op.not]: null } } })
    ]);

    res.json({
      success: true,
      data: {
        estudiantes: stats[0],
        empresas: stats[1],
        admins: stats[2],
        egresados: stats[3],
        usuariosGoogle: stats[4],
        total: stats[0] + stats[1] + stats[2] + stats[3]
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

// Exportar usuarios
const exportUsuarios = async (req, res) => {
  try {
    const { 
      rol, 
      search,
      dateFrom,
      dateTo,
      hasGoogle,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      format = 'csv',
      includeFields = {}
    } = req.query;

    // Construir filtros
    const where = {};
    if (rol && rol !== 'all') {
      where.rol = rol;
    }
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (dateFrom) {
      where.createdAt = { [Op.gte]: new Date(dateFrom) };
    }
    if (dateTo) {
      if (where.createdAt) {
        where.createdAt[Op.lte] = new Date(dateTo);
      } else {
        where.createdAt = { [Op.lte]: new Date(dateTo) };
      }
    }
    if (hasGoogle && hasGoogle !== 'all') {
      if (hasGoogle === 'yes') {
        where.googleId = { [Op.not]: null };
      } else {
        where.googleId = null;
      }
    }

    // Obtener usuarios
    const usuarios = await Usuario.findAll({
      where,
      include: [
        {
          model: Empresa,
          required: false,
          attributes: ['nombreEmpresa', 'descripcion', 'telefono', 'direccion']
        },
        {
          model: Estudiante,
          required: false,
          attributes: ['carrera', 'anioIngreso', 'telefono', 'direccion']
        }
      ],
      attributes: ['id', 'nombre', 'email', 'rol', 'googleId', 'createdAt', 'updatedAt'],
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    // Formatear datos según campos solicitados
    const fields = includeFields ? JSON.parse(includeFields) : {
      id: true, nombre: true, email: true, rol: true, fechaRegistro: true
    };

    const formattedData = usuarios.map(usuario => {
      const data = {};
      
      if (fields.id) data.ID = usuario.id;
      if (fields.nombre) data.Nombre = usuario.nombre;
      if (fields.email) data.Email = usuario.email;
      if (fields.rol) data.Rol = usuario.rol;
      if (fields.fechaRegistro) data['Fecha de Registro'] = usuario.createdAt.toLocaleDateString('es-ES');
      if (fields.tieneGoogle) data['Cuenta Google'] = usuario.googleId ? 'Sí' : 'No';
      
      if (fields.empresaInfo && usuario.Empresa) {
        data['Empresa - Nombre'] = usuario.Empresa.nombreEmpresa;
        data['Empresa - Descripción'] = usuario.Empresa.descripcion;
        data['Empresa - Teléfono'] = usuario.Empresa.telefono;
        data['Empresa - Dirección'] = usuario.Empresa.direccion;
      }
      
      if (fields.estudianteInfo && usuario.Estudiante) {
        data['Estudiante - Carrera'] = usuario.Estudiante.carrera;
        data['Estudiante - Año Ingreso'] = usuario.Estudiante.anioIngreso;
        data['Estudiante - Teléfono'] = usuario.Estudiante.telefono;
        data['Estudiante - Dirección'] = usuario.Estudiante.direccion;
      }
      
      return data;
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=usuarios_${new Date().toISOString().split('T')[0]}.json`);
      return res.json(formattedData);
    }

    // Formato CSV
    if (formattedData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay usuarios para exportar'
      });
    }

    const headers = Object.keys(formattedData[0]);
    const csvContent = [
      headers.join(','),
      ...formattedData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escapar comillas y agregar comillas si contiene comas
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(','),
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\ufeff' + csvContent); // BOM para Excel

  } catch (error) {
    console.error('Error al exportar usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al exportar usuarios'
    });
  }
};

module.exports = {
  getUsuarios,
  createAdmin,
  updateUsuario,
  deleteUsuario,
  getUsuariosStats,
  exportUsuarios,
};
