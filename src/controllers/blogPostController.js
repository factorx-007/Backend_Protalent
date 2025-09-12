const { BlogPost, Categoria, BlogPostMedia, BlogPostReaction, Comentario, Usuario } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.crearPost = async (req, res) => {
  try {
    const { titulo, contenido, autorId, autorTipo } = req.body;
    if (!titulo || !contenido || !autorId || !autorTipo) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!['usuario', 'empresa'].includes(autorTipo)) {
      return res.status(400).json({ error: 'Tipo de autor inválido' });
    }
    // Solo el usuario autenticado puede crear posts a su nombre
    if (req.user.id !== Number(autorId) && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para crear posts con este autorId' });
    }
    const nuevoPost = await BlogPost.create(req.body);
    res.status(201).json({ mensaje: 'Post creado', post: nuevoPost });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear post', detalle: error.message });
  }
};

exports.obtenerPosts = async (req, res) => {
  try {
    const { order = 'recientes', limit = 10, offset = 0 } = req.query;
    let orderBy = [['createdAt', 'DESC']];

    if (order === 'interacciones') {
      orderBy = [
        [literal('(SELECT COUNT(*) FROM BlogPostReactions WHERE BlogPostReactions.blogPostId = BlogPost.id)'), 'DESC'],
        [literal('(SELECT COUNT(*) FROM Comentarios WHERE Comentarios.blogPostId = BlogPost.id)'), 'DESC'],
        ['compartidos', 'DESC'],
        ['createdAt', 'DESC']
      ];
    } else if (order === 'comentarios') {
      orderBy = [[literal('(SELECT COUNT(*) FROM Comentarios WHERE Comentarios.blogPostId = BlogPost.id)'), 'DESC']];
    } else if (order === 'reacciones') {
      orderBy = [[literal('(SELECT COUNT(*) FROM BlogPostReactions WHERE BlogPostReactions.blogPostId = BlogPost.id)'), 'DESC']];
    } else if (order === 'compartidos') {
      orderBy = [['compartidos', 'DESC']];
    }

    const posts = await BlogPost.findAll({
      include: [
        { model: Categoria, attributes: ['nombre'] },
        { model: BlogPostMedia },
        { model: BlogPostReaction },
        {
          model: Comentario,
          attributes: [],
        }
      ],
      order: orderBy,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener posts', detalle: error.message });
  }
};

exports.obtenerPostPorId = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id, {
      include: { model: Categoria, attributes: ['nombre'] }
    });
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar post' });
  }
};

exports.actualizarPost = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    // Solo el autor o admin puede editar
    if (req.user.id !== post.autorId && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para editar este post' });
    }
    await post.update(req.body);
    res.json({ mensaje: 'Post actualizado', post });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar post' });
  }
};

exports.eliminarPost = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    // Solo el autor o admin puede eliminar
    if (req.user.id !== post.autorId && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar este post' });
    }
    await post.destroy();
    res.json({ mensaje: 'Post eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar post' });
  }
};

// Subir media a un post
exports.agregarMedia = async (req, res) => {
  try {
    const { blogPostId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No se encontró archivo para subir' });
    const { path: ruta, mimetype: tipo, size: tamano } = req.file;
    const media = await BlogPostMedia.create({ blogPostId, ruta, tipo, tamano });
    res.status(201).json({ mensaje: 'Media agregada', media });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar media', detalle: error.message });
  }
};

// Obtener media de un post
exports.obtenerMedia = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    const media = await BlogPostMedia.findAll({ where: { blogPostId } });
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener media', detalle: error.message });
  }
};

// Añadir o actualizar reacción a un post
exports.reaccionar = async (req, res) => {
  try {
    const { tipo } = req.body;
    const blogPostId = parseInt(req.params.id) || parseInt(req.body.blogPostId); // Obtener de URL o body
    const userId = req.user.id;
    
    console.log(`Usuario ${userId} intentando reaccionar al post ${blogPostId} con tipo: ${tipo}`);
    
    if (!blogPostId || isNaN(blogPostId)) {
      return res.status(400).json({ error: 'ID del post requerido y debe ser un número válido' });
    }
    
    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reacción inválido' });
    }
    
    let reaccion = await BlogPostReaction.findOne({ where: { blogPostId, userId } });
    console.log(`Reacción existente encontrada:`, reaccion ? `Sí (tipo: ${reaccion.tipo})` : 'No');
    
    if (reaccion) {
      if (reaccion.tipo === tipo) {
        // Si es la misma reacción, eliminarla (toggle)
        await reaccion.destroy();
        console.log(`Reacción eliminada (toggle) para usuario ${userId} en post ${blogPostId}`);
        res.json({ mensaje: 'Reacción eliminada' });
      } else {
        // Si es diferente, actualizarla
        await reaccion.update({ tipo });
        console.log(`Reacción actualizada para usuario ${userId} en post ${blogPostId}: ${tipo}`);
        res.json({ mensaje: 'Reacción actualizada', reaccion });
      }
    } else {
      reaccion = await BlogPostReaction.create({ blogPostId, userId, tipo });
      console.log(`Nueva reacción creada para usuario ${userId} en post ${blogPostId}: ${tipo}`);
      res.json({ mensaje: 'Reacción registrada', reaccion });
    }
  } catch (error) {
    console.error('Error en reaccionar:', error);
    res.status(500).json({ error: 'Error al reaccionar', detalle: error.message });
  }
};

// Obtener reacciones de un post
exports.obtenerReacciones = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Obteniendo reacciones para el post ID: ${id}`);
    
    // Convertir a número para asegurar compatibilidad
    const blogPostId = parseInt(id);
    if (isNaN(blogPostId)) {
      return res.status(400).json({ error: 'ID de post inválido' });
    }
    
    const reacciones = await BlogPostReaction.findAll({ 
      where: { blogPostId: blogPostId },
      attributes: ['id', 'blogPostId', 'userId', 'tipo', 'createdAt', 'updatedAt']
    });
    
    console.log(`Encontradas ${reacciones.length} reacciones para el post ${blogPostId}`);
    res.json(reacciones);
  } catch (error) {
    console.error('Error en obtenerReacciones:', error);
    res.status(500).json({ error: 'Error al obtener reacciones', detalle: error.message });
  }
};

// Obtener reacciones de un post - NUEVO ENDPOINT
exports.obtenerReaccionesPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    console.log(`Obteniendo reacciones para post ID: ${postId}`);
    
    // Validar que el ID sea válido
    if (!postId || isNaN(parseInt(postId))) {
      return res.status(400).json({ 
        error: 'ID de post inválido',
        postId: postId 
      });
    }
    
    // Verificar que el post existe
    const post = await BlogPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ 
        error: 'Post no encontrado',
        postId: postId 
      });
    }
    
    // Obtener todas las reacciones del post
    const reacciones = await BlogPostReaction.findAll({
      where: { blogPostId: parseInt(postId) },
      attributes: ['id', 'blogPostId', 'userId', 'tipo', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Encontradas ${reacciones.length} reacciones para post ${postId}`);
    
    // Contar reacciones por tipo
    const resumen = {
      total: reacciones.length,
      likes: reacciones.filter(r => r.tipo === 'like').length,
      loves: reacciones.filter(r => r.tipo === 'love').length,
      hahas: reacciones.filter(r => r.tipo === 'haha').length,
      wows: reacciones.filter(r => r.tipo === 'wow').length,
      sads: reacciones.filter(r => r.tipo === 'sad').length,
      angrys: reacciones.filter(r => r.tipo === 'angry').length
    };
    
    res.json({
      postId: parseInt(postId),
      reacciones: reacciones,
      resumen: resumen
    });
    
  } catch (error) {
    console.error('Error en obtenerReaccionesPost:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener reacciones',
      detalle: error.message,
      postId: req.params.postId
    });
  }
};

// Obtener posts por categoría - NUEVO ENDPOINT
exports.obtenerPostsPorCategoria = async (req, res) => {
  try {
    const categoriaId = req.params.categoriaId;
    
    console.log(`Obteniendo posts para categoría ID: ${categoriaId}`);
    
    // Validar que el ID sea válido
    if (!categoriaId || isNaN(parseInt(categoriaId))) {
      return res.status(400).json({ 
        error: 'ID de categoría inválido',
        categoriaId: categoriaId 
      });
    }
    
    // Verificar que la categoría existe
    const { Categoria } = require('../models');
    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      return res.status(404).json({ 
        error: 'Categoría no encontrada',
        categoriaId: categoriaId 
      });
    }
    
    const { order = 'recientes', limit = 50, offset = 0 } = req.query;
    let orderBy = [['createdAt', 'DESC']];

    if (order === 'interacciones') {
      orderBy = [
        [literal('(SELECT COUNT(*) FROM BlogPostReactions WHERE BlogPostReactions.blogPostId = BlogPost.id)'), 'DESC'],
        [literal('(SELECT COUNT(*) FROM Comentarios WHERE Comentarios.blogPostId = BlogPost.id)'), 'DESC'],
        ['compartidos', 'DESC'],
        ['createdAt', 'DESC']
      ];
    } else if (order === 'comentarios') {
      orderBy = [[literal('(SELECT COUNT(*) FROM Comentarios WHERE Comentarios.blogPostId = BlogPost.id)'), 'DESC']];
    } else if (order === 'reacciones') {
      orderBy = [[literal('(SELECT COUNT(*) FROM BlogPostReactions WHERE BlogPostReactions.blogPostId = BlogPost.id)'), 'DESC']];
    } else if (order === 'compartidos') {
      orderBy = [['compartidos', 'DESC']];
    }

    const posts = await BlogPost.findAll({
      where: { categoriaId: parseInt(categoriaId) },
      include: [
        { model: Categoria, attributes: ['nombre'] },
        { model: BlogPostMedia },
        { model: BlogPostReaction },
        {
          model: Comentario,
          attributes: [],
        }
      ],
      order: orderBy,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    console.log(`Encontrados ${posts.length} posts para categoría ${categoriaId}`);
    
    res.json({
      categoriaId: parseInt(categoriaId),
      categoria: categoria.nombre,
      total: posts.length,
      posts: posts
    });
    
  } catch (error) {
    console.error('Error en obtenerPostsPorCategoria:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener posts por categoría',
      detalle: error.message,
      categoriaId: req.params.categoriaId
    });
  }
};
