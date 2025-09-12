const express = require('express');
const router = express.Router();
const postulacionController = require('../controllers/postulacionController');
const verifyToken = require('../middlewares/verifyToken');
const requireCompleteProfile = require('../middlewares/requireCompleteProfile');

// Middleware personalizado para empresas (no requieren verificación de perfil)
const requireCompleteProfileForStudents = (req, res, next) => {
  if (req.user.rol === 'empresa') {
    return next(); // Las empresas no necesitan verificación adicional
  }
  return requireCompleteProfile(req, res, next);
};

// 🔐 Rutas protegidas (requieren login Y perfil completo solo para estudiantes)
router.post('/', verifyToken, requireCompleteProfileForStudents, postulacionController.crearPostulacion);
router.get('/', verifyToken, requireCompleteProfileForStudents, postulacionController.obtenerPostulaciones);
router.get('/oferta/:ofertaId', verifyToken, requireCompleteProfileForStudents, postulacionController.obtenerPostulacionesPorOferta);
router.put('/:id/estado', verifyToken, requireCompleteProfileForStudents, postulacionController.actualizarEstadoPostulacion);

// 🔓 Rutas públicas
router.get('/:id', postulacionController.obtenerPostulacionPorId);

module.exports = router;
