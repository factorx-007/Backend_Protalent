const { Comentario, ComentarioMedia, ComentarioReaction } = require('../models');

exports.crearComentario = async (req, res) => {
  try {
    const { contenido, blogPostId, autorId, autorTipo } = req.body;
    if (!contenido || !blogPostId || !autorId || !autorTipo) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!['usuario', 'empresa'].includes(autorTipo)) {
      return res.status(400).json({ error: 'Tipo de autor inválido' });
    }
    // Solo el usuario autenticado puede comentar a su nombre
    if (req.user.id !== Number(autorId) && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para comentar con este autorId' });
    }
    const comentario = await Comentario.create(req.body);
    res.status(201).json({ mensaje: 'Comentario creado', comentario });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear comentario', detalle: error.message });
  }
};

exports.obtenerComentarios = async (req, res) => {
  try {
    const comentarios = await Comentario.findAll();
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

exports.obtenerComentarioPorId = async (req, res) => {
  try {
    const comentario = await Comentario.findByPk(req.params.id);
    if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });
    res.json(comentario);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar comentario' });
  }
};

exports.actualizarComentario = async (req, res) => {
  try {
    const comentario = await Comentario.findByPk(req.params.id);
    if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });
    // Solo el autor o admin puede editar
    if (req.user.id !== comentario.autorId && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para editar este comentario' });
    }
    await comentario.update(req.body);
    res.json({ mensaje: 'Comentario actualizado', comentario });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar comentario' });
  }
};

exports.eliminarComentario = async (req, res) => {
  try {
    const comentario = await Comentario.findByPk(req.params.id);
    if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });
    // Solo el autor o admin puede eliminar
    if (req.user.id !== comentario.autorId && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar este comentario' });
    }
    await comentario.destroy();
    res.json({ mensaje: 'Comentario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
};

// Subir media a un comentario
exports.agregarMedia = async (req, res) => {
  try {
    const { comentarioId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No se encontró archivo para subir' });
    const { path: ruta, mimetype: tipo, size: tamano } = req.file;
    const media = await ComentarioMedia.create({ comentarioId, ruta, tipo, tamano });
    res.status(201).json({ mensaje: 'Media agregada', media });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar media', detalle: error.message });
  }
};

// Obtener media de un comentario
exports.obtenerMedia = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const media = await ComentarioMedia.findAll({ where: { comentarioId } });
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener media', detalle: error.message });
  }
};

// Añadir o actualizar reacción a un comentario
exports.reaccionar = async (req, res) => {
  try {
    const { comentarioId, tipo } = req.body;
    const userId = req.user.id;
    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reacción inválido' });
    }
    let reaccion = await ComentarioReaction.findOne({ where: { comentarioId, userId } });
    if (reaccion) {
      await reaccion.update({ tipo });
    } else {
      reaccion = await ComentarioReaction.create({ comentarioId, userId, tipo });
    }
    res.json({ mensaje: 'Reacción registrada', reaccion });
  } catch (error) {
    res.status(500).json({ error: 'Error al reaccionar', detalle: error.message });
  }
};

// Obtener reacciones de un comentario
exports.obtenerReacciones = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const reacciones = await ComentarioReaction.findAll({ where: { comentarioId } });
    res.json(reacciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reacciones', detalle: error.message });
  }
};

// Obtener comentarios anidados de un post
exports.obtenerComentariosAnidados = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    // Obtener todos los comentarios del post
    const comentarios = await Comentario.findAll({
      where: { blogPostId },
      order: [['createdAt', 'ASC']]
    });
    // Construir árbol de comentarios
    const map = {};
    const roots = [];
    comentarios.forEach(comentario => {
      map[comentario.id] = { ...comentario.dataValues, respuestas: [] };
    });
    comentarios.forEach(comentario => {
      if (comentario.parentId) {
        map[comentario.parentId]?.respuestas.push(map[comentario.id]);
      } else {
        roots.push(map[comentario.id]);
      }
    });
    res.json(roots);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios anidados', detalle: error.message });
  }
};
