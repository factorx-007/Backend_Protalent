const { Comentario, BlogPost, Usuario, Estudiante, Empresa, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los comentarios con filtros
const getComentarios = async (req, res) => {
  try {
    const { page = 1, limit = 20, blogPostId, buscar } = req.query;
    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    const whereConditions = {};
    
    if (blogPostId && blogPostId !== 'all') {
      whereConditions.blogPostId = blogPostId;
    }
    
    if (buscar) {
      whereConditions.contenido = { [Op.like]: `%${buscar}%` };
    }

    const { count, rows: comentarios } = await Comentario.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: BlogPost,
          attributes: ['id', 'titulo'],
          required: true
        }
      ],
      attributes: ['id', 'contenido', 'autorId', 'autorTipo', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        comentarios: comentarios.map(comentario => ({
          id: comentario.id,
          contenido: comentario.contenido,
          autorId: comentario.autorId,
          autorTipo: comentario.autorTipo,
          autor: {
            nombre: `${comentario.autorTipo || 'Usuario'} ${comentario.autorId || 'Anónimo'}`,
            tipo: comentario.autorTipo || 'usuario'
          },
          blogPost: comentario.BlogPost,
          createdAt: comentario.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
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
    
    const comentario = await Comentario.findByPk(id, {
      include: [
        {
          model: BlogPost,
          attributes: ['id', 'titulo']
        }
      ]
    });

    if (!comentario) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        comentario: {
          ...comentario.toJSON(),
          autor: {
            nombre: `${comentario.autorTipo || 'Usuario'} ${comentario.autorId || 'Anónimo'}`,
            tipo: comentario.autorTipo || 'usuario'
          }
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener comentario:', error);
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

    const comentario = await Comentario.findByPk(id);

    if (!comentario) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    await comentario.destroy();

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar comentario'
    });
  }
};

// Obtener estadísticas de comentarios
const getComentarioStats = async (req, res) => {
  try {
    const totalComentarios = await Comentario.count();
    
    const comentariosPorBlogPost = await Comentario.findAll({
      include: [
        {
          model: BlogPost,
          attributes: ['id', 'titulo']
        }
      ],
      attributes: [
        'blogPostId',
        [sequelize.fn('COUNT', sequelize.col('Comentario.id')), 'totalComentarios']
      ],
      group: ['blogPostId', 'BlogPost.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Comentario.id')), 'DESC']],
      limit: 10,
      raw: false
    });

    const comentariosRecientes = await Comentario.findAll({
      include: [
        {
          model: BlogPost,
          attributes: ['id', 'titulo']
        }
      ],
      attributes: ['id', 'contenido', 'autorId', 'autorTipo', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totalComentarios,
        comentariosPorBlogPost: comentariosPorBlogPost.map(item => ({
          blogPost: item.BlogPost,
          totalComentarios: item.dataValues.totalComentarios
        })),
        comentariosRecientes: comentariosRecientes.map(comentario => ({
          ...comentario.toJSON(),
          autor: {
            nombre: `${comentario.autorTipo || 'Usuario'} ${comentario.autorId || 'Anónimo'}`,
            tipo: comentario.autorTipo || 'usuario'
          }
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de comentarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  getComentarios,
  getComentarioById,
  deleteComentario,
  getComentarioStats
};
