const adminComentariosService = require('../services/adminComentariosService');

// Obtener todos los comentarios con filtros
const getComentarios = async (req, res) => {
  try {
    const result = await adminComentariosService.obtenerComentarios(req.query);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener comentarios'
    });
  }
};

// Obtener comentario por ID
const getComentarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const comentario = await adminComentariosService.obtenerComentarioPorId(id);

    res.json({
      success: true,
      data: { comentario }
    });
  } catch (error) {
    console.error('Error al obtener comentario:', error);
    
    if (error.message === 'Comentario no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener comentario'
    });
  }
};

// Eliminar comentario
const deleteComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminComentariosService.eliminarComentario(id);

    res.json({
      success: true,
      message: result.mensaje
    });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    
    if (error.message === 'Comentario no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar comentario'
    });
  }
};

// Eliminar múltiples comentarios
const deleteComentariosLote = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar una lista de IDs válida'
      });
    }

    const result = await adminComentariosService.eliminarComentariosEnLote(ids);

    res.json({
      success: true,
      message: result.mensaje
    });
  } catch (error) {
    console.error('Error al eliminar comentarios en lote:', error);
    
    if (error.message.includes('No se encontraron')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar comentarios'
    });
  }
};

// Obtener estadísticas de comentarios
const getComentarioStats = async (req, res) => {
  try {
    const estadisticas = await adminComentariosService.obtenerEstadisticas();

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de comentarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

// Obtener comentarios por blog post
const getComentariosPorPost = async (req, res) => {
  try {
    const { limite } = req.query;
    const comentarios = await adminComentariosService.obtenerComentariosPorBlogPost(limite);

    res.json({
      success: true,
      data: { comentariosPorPost: comentarios }
    });
  } catch (error) {
    console.error('Error al obtener comentarios por post:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Filtrar comentarios ofensivos
const getComentariosOfensivos = async (req, res) => {
  try {
    const comentarios = await adminComentariosService.filtrarComentariosOfensivos();

    res.json({
      success: true,
      data: { 
        comentarios,
        total: comentarios.length 
      }
    });
  } catch (error) {
    console.error('Error al filtrar comentarios ofensivos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Aprobar comentario (placeholder para funcionalidad futura)
const aprobarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado = true } = req.body;

    // Por ahora solo confirmamos la acción
    // En el futuro se podría agregar un campo 'estado' al schema
    res.json({
      success: true,
      message: `Comentario ${aprobado ? 'aprobado' : 'rechazado'} exitosamente`,
      data: { id: parseInt(id), aprobado }
    });
  } catch (error) {
    console.error('Error al aprobar comentario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al aprobar comentario'
    });
  }
};

module.exports = {
  getComentarios,
  getComentarioById,
  deleteComentario,
  deleteComentariosLote,
  getComentarioStats,
  getComentariosPorPost,
  getComentariosOfensivos,
  aprobarComentario
};