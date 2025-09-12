const adminUsuariosService = require('../services/adminUsuariosService');

// Obtener todos los usuarios con paginación y filtros
const getUsuarios = async (req, res) => {
  try {
    const result = await adminUsuariosService.obtenerUsuarios(req.query);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await adminUsuariosService.obtenerUsuarioPorId(id);

    res.json({
      success: true,
      data: { usuario }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminUsuariosService.eliminarUsuario(id);

    res.json({
      success: true,
      message: result.mensaje
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (error.message.includes('administrador')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de usuarios
const getUsuariosStats = async (req, res) => {
  try {
    const estadisticas = await adminUsuariosService.obtenerEstadisticas();

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Buscar usuarios
const buscarUsuarios = async (req, res) => {
  try {
    const { q: termino, limit } = req.query;
    const result = await adminUsuariosService.buscarUsuarios(termino, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    
    if (error.message.includes('2 caracteres')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Cambiar rol de usuario
const cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoRol } = req.body;

    const usuarioActualizado = await adminUsuariosService.cambiarRol(id, nuevoRol);

    res.json({
      success: true,
      data: { usuario: usuarioActualizado },
      message: 'Rol actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (error.message.includes('válido') || error.message.includes('administrador')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  eliminarUsuario,
  getUsuariosStats,
  buscarUsuarios,
  cambiarRolUsuario
};