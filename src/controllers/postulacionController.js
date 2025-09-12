const { Postulacion, RespuestaPostulacion, Oferta, Estudiante, PreguntaOferta } = require('../models');

exports.crearPostulacion = async (req, res) => {
  try {
    const { ofertaId, estudianteId, respuestas, cvUrl, cartaUrl } = req.body;

    // Verificar que la oferta existe
    const oferta = await Oferta.findByPk(ofertaId, {
      include: [{ model: PreguntaOferta }]
    });

    if (!oferta) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    // Verificar que el estudiante existe
    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Verificar que no haya una postulación previa del mismo estudiante
    const postulacionExistente = await Postulacion.findOne({
      where: { ofertaId, estudianteId }
    });

    if (postulacionExistente) {
      return res.status(400).json({ error: 'Ya has postulado a esta oferta' });
    }

    // Validar documentos requeridos
    if (oferta.requiereCV && !cvUrl) {
      return res.status(400).json({ error: 'CV es requerido para esta oferta' });
    }

    if (oferta.requiereCarta && !cartaUrl) {
      return res.status(400).json({ error: 'Carta de presentación es requerida para esta oferta' });
    }

    // Crear la postulación
    const nuevaPostulacion = await Postulacion.create({
      ofertaId,
      estudianteId,
      cvUrl,
      cartaUrl,
      estado: 'pendiente' // pendiente, revisada, aceptada, rechazada
    });

    // Crear las respuestas a las preguntas
    if (respuestas && Array.isArray(respuestas)) {
      const respuestasACrear = respuestas.map(respuesta => ({
          postulacionId: nuevaPostulacion.id,
        preguntaOfertaId: respuesta.preguntaId,
        respuesta: respuesta.respuesta
        }));

        await RespuestaPostulacion.bulkCreate(respuestasACrear);
    }

    // Retornar la postulación completa con respuestas
    const postulacionCompleta = await Postulacion.findByPk(nuevaPostulacion.id, {
      include: [
        {
          model: RespuestaPostulacion,
          include: [{ model: PreguntaOferta }]
        },
        { model: Oferta },
        { model: Estudiante }
      ]
    });

    res.status(201).json({ 
      mensaje: 'Postulación creada exitosamente', 
      postulacion: postulacionCompleta
    });

  } catch (error) {
    console.error('Error al crear postulación:', error);
    res.status(500).json({ error: 'Error al crear postulación', detalle: error.message });
  }
};

exports.obtenerPostulaciones = async (req, res) => {
  try {
    const { estudianteId } = req.query;

    let whereClause = {};
    if (estudianteId) {
      whereClause.estudianteId = estudianteId;
    }

    const postulaciones = await Postulacion.findAll({
      where: whereClause,
      include: [
        {
          model: RespuestaPostulacion,
          include: [{ model: PreguntaOferta }]
        },
        { 
          model: Oferta, 
          include: [{ model: require('../models').Empresa }]
        },
        { model: Estudiante }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(postulaciones);
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({ error: 'Error al obtener postulaciones', detalle: error.message });
  }
};

exports.obtenerPostulacionPorId = async (req, res) => {
  try {
    const postulacion = await Postulacion.findByPk(req.params.id, {
      include: [
        { 
          model: RespuestaPostulacion,
          include: [{ model: PreguntaOferta }]
        },
        { 
          model: Oferta,
          include: [{ model: require('../models').Empresa }]
        },
        { 
          model: Estudiante,
          include: [{ model: require('../models').Usuario }]
        }
      ]
    });

    if (!postulacion) {
      return res.status(404).json({ error: 'Postulación no encontrada' });
    }

    res.json(postulacion);
  } catch (error) {
    console.error('Error al obtener postulación:', error);
    res.status(500).json({ error: 'Error al obtener postulación', detalle: error.message });
  }
};

exports.actualizarEstadoPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentarios, puntuacion, recomendacion } = req.body;

    const postulacion = await Postulacion.findByPk(id);
    if (!postulacion) {
      return res.status(404).json({ error: 'Postulación no encontrada' });
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'revisada', 'aceptada', 'rechazada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Validar puntuación
    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      return res.status(400).json({ error: 'Puntuación debe estar entre 1 y 5' });
    }

    // Validar recomendación
    const recomendacionesValidas = ['altamente_recomendado', 'recomendado', 'neutral', 'no_recomendado'];
    if (recomendacion && !recomendacionesValidas.includes(recomendacion)) {
      return res.status(400).json({ error: 'Recomendación no válida' });
    }

    await postulacion.update({
      estado,
      comentarios: comentarios || postulacion.comentarios,
      puntuacion: puntuacion || postulacion.puntuacion,
      recomendacion: recomendacion || postulacion.recomendacion,
      fechaEvaluacion: new Date(),
      evaluadoPor: req.user.id
    });

    res.json({
      mensaje: 'Postulación evaluada exitosamente',
      postulacion
    });
  } catch (error) {
    console.error('Error al actualizar estado de postulación:', error);
    res.status(500).json({ error: 'Error al actualizar estado', detalle: error.message });
  }
};

exports.obtenerPostulacionesPorOferta = async (req, res) => {
  try {
    const { ofertaId } = req.params;

    const postulaciones = await Postulacion.findAll({
      where: { ofertaId },
      include: [
        {
          model: RespuestaPostulacion,
          include: [{ model: PreguntaOferta }]
        },
        { 
          model: Estudiante,
          include: [{ model: require('../models').Usuario }]
        },
        { model: Oferta }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(postulaciones);
  } catch (error) {
    console.error('Error al obtener postulaciones por oferta:', error);
    res.status(500).json({ error: 'Error al obtener postulaciones', detalle: error.message });
  }
};
