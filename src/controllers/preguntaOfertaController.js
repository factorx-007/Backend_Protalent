// src/controllers/preguntaOfertaController.js
const { PreguntaOferta, Oferta, Empresa } = require('../models');

// Crear pregunta para una oferta
const crearPregunta = async (req, res) => {
  try {
    const { ofertaId, pregunta, tipo, opciones, requerida, orden } = req.body;
    const usuarioId = req.user.id;

    // Verificar que la oferta existe y pertenece a la empresa del usuario
    const oferta = await Oferta.findByPk(ofertaId, {
      include: [{
        model: Empresa,
        where: { usuarioId }
      }]
    });

    if (!oferta) {
      return res.status(404).json({ error: 'Oferta no encontrada o no tienes permisos para editarla' });
    }

    // Validar tipo de pregunta
    if (tipo === 'select' && (!opciones || !Array.isArray(opciones) || opciones.length === 0)) {
      return res.status(400).json({ error: 'Las preguntas de tipo "select" deben tener opciones' });
    }

    const nuevaPregunta = await PreguntaOferta.create({
      ofertaId,
      pregunta,
      tipo: tipo || 'text',
      opciones: tipo === 'select' ? opciones : null,
      requerida: requerida || false,
      orden: orden || 1
    });

    res.status(201).json({
      mensaje: 'Pregunta creada exitosamente',
      pregunta: nuevaPregunta
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pregunta', detalle: error.message });
  }
};

// Obtener preguntas de una oferta
const obtenerPreguntasPorOferta = async (req, res) => {
  try {
    const { ofertaId } = req.params;

    const preguntas = await PreguntaOferta.findAll({
      where: { ofertaId },
      order: [['orden', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json({
      mensaje: 'Preguntas de la oferta',
      preguntas
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener preguntas', detalle: error.message });
  }
};

// Actualizar pregunta
const actualizarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const { pregunta, tipo, opciones, requerida, orden } = req.body;
    const usuarioId = req.user.id;

    // Verificar que la pregunta existe y el usuario tiene permisos
    const preguntaExistente = await PreguntaOferta.findByPk(id, {
      include: [{
        model: Oferta,
        include: [{
          model: Empresa,
          where: { usuarioId }
        }]
      }]
    });

    if (!preguntaExistente) {
      return res.status(404).json({ error: 'Pregunta no encontrada o no tienes permisos para editarla' });
    }

    // Validar tipo de pregunta
    if (tipo === 'select' && (!opciones || !Array.isArray(opciones) || opciones.length === 0)) {
      return res.status(400).json({ error: 'Las preguntas de tipo "select" deben tener opciones' });
    }

    await preguntaExistente.update({
      pregunta,
      tipo,
      opciones: tipo === 'select' ? opciones : null,
      requerida,
      orden
    });

    res.json({
      mensaje: 'Pregunta actualizada exitosamente',
      pregunta: preguntaExistente
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar pregunta', detalle: error.message });
  }
};

// Eliminar pregunta
const eliminarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    // Verificar que la pregunta existe y el usuario tiene permisos
    const pregunta = await PreguntaOferta.findByPk(id, {
      include: [{
        model: Oferta,
        include: [{
          model: Empresa,
          where: { usuarioId }
        }]
      }]
    });

    if (!pregunta) {
      return res.status(404).json({ error: 'Pregunta no encontrada o no tienes permisos para eliminarla' });
    }

    await pregunta.destroy();
    res.json({ mensaje: 'Pregunta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pregunta', detalle: error.message });
  }
};

module.exports = {
  crearPregunta,
  obtenerPreguntasPorOferta,
  actualizarPregunta,
  eliminarPregunta
};
