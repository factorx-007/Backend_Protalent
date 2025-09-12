const { prisma } = require('../config/database');
const { uploadFile, deleteFile } = require('../config/cloudinary');

// Obtener todos los blog posts
const getBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria, autor, buscar } = req.query;
    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    const whereConditions = {};
    
    if (categoria && categoria !== 'all') {
      whereConditions.categoriaId = categoria;
    }
    
    if (autor && autor !== 'all') {
      whereConditions.autorId = autor;
    }
    
    if (buscar) {
      whereConditions[Op.or] = [
        { titulo: { [Op.like]: `%${buscar}%` } },
        { contenido: { [Op.like]: `%${buscar}%` } }
      ];
    }

    const { count, rows: blogPosts } = await BlogPost.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Categoria,
          attributes: ['id', 'nombre']
        },
        {
          model: BlogPostMedia,
          attributes: ['id', 'tipo', 'ruta']
        }
      ],
      attributes: ['id', 'titulo', 'contenido', 'autorId', 'autorTipo', 'compartidos', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        blogPosts: blogPosts.map(post => ({
          id: post.id,
          titulo: post.titulo,
          contenido: post.contenido,
          autorId: post.autorId,
          autorTipo: post.autorTipo,
          autor: { 
            nombre: `${post.autorTipo === 'admin' ? 'Administrador' : 'Usuario'} ${post.autorId}`,
            tipo: post.autorTipo
          },
          categoria: post.Categoria,
          compartidos: post.compartidos || 0,
          totalReacciones: 0, // Simplificado por ahora
          totalComentarios: 0, // Simplificado por ahora
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
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
    console.error('Error al obtener blog posts:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener blog posts'
    });
  }
};

// Obtener un blog post por ID
const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blogPost = await BlogPost.findByPk(id, {
      include: [
        {
          model: Categoria,
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        blogPost: {
          ...blogPost.toJSON(),
          autor: {
            nombre: `${blogPost.autorTipo === 'admin' ? 'Administrador' : 'Usuario'} ${blogPost.autorId}`,
            tipo: blogPost.autorTipo
          }
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener blog post'
    });
  }
};

// Crear nuevo blog post
const createBlogPost = async (req, res) => {
  try {
    const { titulo, contenido, categoriaId } = req.body;
    const autorId = req.adminUser.id; // ID del admin que crea el post

    // Validaciones
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El título del blog post es requerido'
      });
    }

    if (!contenido || contenido.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El contenido del blog post es requerido'
      });
    }

    // Verificar que la categoría existe
    if (categoriaId) {
      const categoria = await Categoria.findByPk(categoriaId);
      if (!categoria) {
        return res.status(400).json({
          success: false,
          error: 'La categoría especificada no existe'
        });
      }
    }

    // Crear el blog post
    const nuevoBlogPost = await BlogPost.create({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoriaId: categoriaId || null,
      autorId: autorId,
      autorTipo: 'usuario' // Admin es considerado usuario
    });

    // Si hay una imagen de portada, crear el registro en BlogPostMedia
    if (req.file) {
      await BlogPostMedia.create({
        blogPostId: nuevoBlogPost.id,
        tipo: 'imagen',
        ruta: req.file.path,
        tamano: req.file.size || 0
      });
    }

    // Obtener el blog post completo con sus relaciones
    const blogPostCompleto = await BlogPost.findByPk(nuevoBlogPost.id, {
      include: [
        {
          model: Categoria,
          attributes: ['id', 'nombre']
        },
        {
          model: BlogPostMedia,
          attributes: ['id', 'tipo', 'ruta']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Blog post creado exitosamente',
      data: {
        blogPost: blogPostCompleto
      }
    });

  } catch (error) {
    console.error('Error al crear blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear blog post'
    });
  }
};

// Actualizar blog post
const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, categoriaId } = req.body;

    const blogPost = await BlogPost.findByPk(id);

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post no encontrado'
      });
    }

    // Validaciones
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El título del blog post es requerido'
      });
    }

    if (!contenido || contenido.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El contenido del blog post es requerido'
      });
    }

    // Verificar que la categoría existe
    if (categoriaId) {
      const categoria = await Categoria.findByPk(categoriaId);
      if (!categoria) {
        return res.status(400).json({
          success: false,
          error: 'La categoría especificada no existe'
        });
      }
    }

    // Actualizar el blog post
    await blogPost.update({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoriaId: categoriaId || null
    });

    // Si hay una nueva imagen de portada, manejar el reemplazo
    if (req.file) {
      // Buscar si ya existe una imagen de portada
      const imagenExistente = await BlogPostMedia.findOne({
        where: { 
          blogPostId: id,
          tipo: 'imagen'
        }
      });

      if (imagenExistente) {
        // Actualizar el registro con la nueva imagen
        await imagenExistente.update({
          ruta: req.file.path,
          tamano: req.file.size || 0
        });
      } else {
        // Crear nuevo registro de imagen
        await BlogPostMedia.create({
          blogPostId: id,
          tipo: 'imagen',
          ruta: req.file.path,
          tamano: req.file.size || 0
        });
      }
    }

    // Obtener el blog post actualizado con sus relaciones
    const blogPostActualizado = await BlogPost.findByPk(id, {
      include: [
        {
          model: Categoria,
          attributes: ['id', 'nombre']
        },
        {
          model: BlogPostMedia,
          attributes: ['id', 'tipo', 'ruta']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Blog post actualizado exitosamente',
      data: {
        blogPost: blogPostActualizado
      }
    });

  } catch (error) {
    console.error('Error al actualizar blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar blog post'
    });
  }
};

// Eliminar blog post
const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const blogPost = await BlogPost.findByPk(id, {
      include: [
        {
          model: BlogPostMedia,
          attributes: ['id', 'ruta']
        }
      ]
    });

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post no encontrado'
      });
    }

    // Eliminar el blog post (esto también eliminará las relaciones por CASCADE)
    await blogPost.destroy();

    res.json({
      success: true,
      message: 'Blog post eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar blog post'
    });
  }
};

// Obtener estadísticas de blog posts
const getBlogPostStats = async (req, res) => {
  try {
    const totalPosts = await BlogPost.count();
    const totalPorCategoria = await BlogPost.findAll({
      include: [{ model: Categoria, attributes: ['nombre'] }],
      attributes: [
        'categoriaId',
        [sequelize.fn('COUNT', sequelize.col('BlogPost.id')), 'total']
      ],
      group: ['categoriaId', 'Categoria.id'],
      raw: true
    });

    const postsRecientes = await BlogPost.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      attributes: ['id'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalPosts,
        postsRecientes: postsRecientes.length,
        postsPorCategoria: totalPorCategoria
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostStats
};
