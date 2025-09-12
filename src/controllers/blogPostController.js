const { prisma } = require('../config/database');

exports.crearPost = async (req, res) => {
  try {
    const { titulo, contenido, categoriaId } = req.body;
    const autorId = req.user.id;
    
    const post = await prisma.blogPost.create({
      data: {
        titulo,
        contenido,
        autorId,
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
        autorTipo: 'USUARIO'
      },
      include: {
        categoria: true
      }
    });
    
    res.status(201).json({ 
      success: true, 
      data: post 
    });
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.obtenerPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria } = req.query;
    const skip = (page - 1) * limit;
    
    const where = categoria ? { categoriaId: parseInt(categoria) } : {};
    
    const posts = await prisma.blogPost.findMany({
      where,
      take: parseInt(limit),
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        categoria: true,
        medias: true,
        reacciones: true,
        comentarios: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    const total = await prisma.blogPost.count({ where });
    
    res.json({ 
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.obtenerPostPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        medias: true,
        reacciones: true,
        comentarios: {
          include: {
            respuestas: true,
            medias: true,
            reacciones: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post no encontrado'
      });
    }
    
    res.json({ 
      success: true, 
      data: post 
    });
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.obtenerPostsPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const posts = await prisma.blogPost.findMany({
      where: { categoriaId: parseInt(categoriaId) },
      take: parseInt(limit),
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        categoria: true,
        medias: true,
        reacciones: true
      }
    });
    
    const total = await prisma.blogPost.count({
      where: { categoriaId: parseInt(categoriaId) }
    });
    
    res.json({ 
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener posts por categoría:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.actualizarPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, categoriaId } = req.body;
    
    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        contenido,
        categoriaId: categoriaId ? parseInt(categoriaId) : null
      },
      include: {
        categoria: true
      }
    });
    
    res.json({ 
      success: true, 
      data: post 
    });
  } catch (error) {
    console.error('Error al actualizar post:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Post no encontrado'
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.eliminarPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.blogPost.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ 
      success: true, 
      message: 'Post eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Post no encontrado'
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.agregarMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }
    
    const media = await prisma.blogPostMedia.create({
      data: {
        blogPostId: parseInt(id),
        url: req.file.path,
        tipo: 'IMAGEN'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      data: media 
    });
  } catch (error) {
    console.error('Error al agregar media:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.obtenerMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medias = await prisma.blogPostMedia.findMany({
      where: { blogPostId: parseInt(id) },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: medias 
    });
  } catch (error) {
    console.error('Error al obtener media:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.reaccionar = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;
    const usuarioId = req.user.id;
    
    // Verificar si ya existe una reacción del usuario
    const reaccionExistente = await prisma.blogPostReaction.findUnique({
      where: {
        blogPostId_usuarioId: {
          blogPostId: parseInt(id),
          usuarioId: usuarioId
        }
      }
    });
    
    let reaccion;
    if (reaccionExistente) {
      if (reaccionExistente.tipo === tipo) {
        // Si es la misma reacción, eliminarla
        await prisma.blogPostReaction.delete({
          where: { id: reaccionExistente.id }
        });
        return res.json({ 
          success: true, 
          message: 'Reacción eliminada' 
        });
      } else {
        // Si es diferente, actualizarla
        reaccion = await prisma.blogPostReaction.update({
          where: { id: reaccionExistente.id },
          data: { tipo }
        });
      }
    } else {
      // Crear nueva reacción
      reaccion = await prisma.blogPostReaction.create({
        data: {
          blogPostId: parseInt(id),
          usuarioId: usuarioId,
          tipo
        }
      });
    }
    
    res.json({ 
      success: true, 
      data: reaccion 
    });
  } catch (error) {
    console.error('Error al reaccionar:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.obtenerReacciones = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reacciones = await prisma.blogPostReaction.findMany({
      where: { blogPostId: parseInt(id) }
    });
    
    // Agrupar por tipo
    const reaccionesPorTipo = reacciones.reduce((acc, reaccion) => {
      acc[reaccion.tipo] = (acc[reaccion.tipo] || 0) + 1;
      return acc;
    }, {});
    
    res.json({ 
      success: true, 
      data: {
        total: reacciones.length,
        porTipo: reaccionesPorTipo,
        reacciones
      }
    });
  } catch (error) {
    console.error('Error al obtener reacciones:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

exports.obtenerReaccionesPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const reacciones = await prisma.blogPostReaction.findMany({
      where: { blogPostId: parseInt(postId) }
    });
    
    // Agrupar por tipo
    const reaccionesPorTipo = reacciones.reduce((acc, reaccion) => {
      acc[reaccion.tipo] = (acc[reaccion.tipo] || 0) + 1;
      return acc;
    }, {});
    
    res.json({ 
      success: true, 
      data: {
        total: reacciones.length,
        porTipo: reaccionesPorTipo
      }
    });
  } catch (error) {
    console.error('Error al obtener reacciones del post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};