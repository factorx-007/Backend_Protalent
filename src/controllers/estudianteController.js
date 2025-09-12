// src/controllers/estudianteController.js
const { Estudiante, Usuario } = require('../models');

// Crear perfil de estudiante
const crearEstudiante = async (req, res) => {
  const t = await Estudiante.sequelize.transaction();
  
  try {
    const { carrera, año_egreso, anio_egreso, telefono, tipo, direccion } = req.body;
    const usuarioId = req.user?.id || req.body.usuarioId; // Del middleware verifyToken o del body

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID de usuario no proporcionado' });
    }

    // Verificar que el usuario no tenga ya un perfil de estudiante
    const existeEstudiante = await Estudiante.findOne({ where: { usuarioId } });
    if (existeEstudiante) {
      return res.status(400).json({ error: 'Ya existe un perfil de estudiante para este usuario' });
    }

    // Usar año_egreso o anio_egreso, lo que esté disponible
    const anioEgreso = año_egreso || anio_egreso;
    
    if (!anioEgreso) {
      return res.status(400).json({ error: 'El año de egreso es requerido' });
    }

    const estudiante = await Estudiante.create({
      usuarioId,
      carrera,
      anio_egreso,
      telefono,
      tipo: tipo || 'estudiante', // Valor por defecto
      direccion: direccion || ''
    }, { transaction: t });

    // Actualizar el usuario para marcar el perfil como completo
    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
    if (usuario) {
      usuario.perfilCompleto = true;
      await usuario.save({ transaction: t });
    }

    await t.commit();
    
    res.status(201).json({
      mensaje: 'Perfil de estudiante/egresado creado exitosamente',
      estudiante,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        perfilCompleto: usuario.perfilCompleto
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear perfil de estudiante', detalle: error.message });
  }
};

// Obtener todos los estudiantes
const obtenerEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.findAll({
      include: [{ 
        model: Usuario, 
        attributes: ['id', 'nombre', 'email'] 
      }]
    });
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes', detalle: error.message });
  }
};

// Obtener estudiante por ID
const obtenerEstudiantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await Estudiante.findByPk(id, {
      include: [{ 
        model: Usuario, 
        attributes: ['id', 'nombre', 'email'] 
      }]
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(estudiante);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiante', detalle: error.message });
  }
};

// Actualizar estudiante
const actualizarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { carrera, año_egreso, telefono, tipo, cv, foto_perfil } = req.body;

    const estudiante = await Estudiante.findByPk(id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Verificar que el usuario tenga permisos (solo puede editar su propio perfil o ser admin)
    if (estudiante.usuarioId !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
    }

    await estudiante.update({
      carrera,
      anio_egreso: año_egreso,
      telefono,
      tipo,
      cv,
      foto_perfil
    });

    res.json({
      mensaje: 'Perfil de estudiante actualizado exitosamente',
      estudiante
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estudiante', detalle: error.message });
  }
};

// Eliminar estudiante
const eliminarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await Estudiante.findByPk(id);

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Solo admin puede eliminar perfiles
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar perfiles' });
    }

    await estudiante.destroy();
    res.json({ mensaje: 'Perfil de estudiante eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar estudiante', detalle: error.message });
  }
};

module.exports = {
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  eliminarEstudiante
};
