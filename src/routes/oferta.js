const express = require('express');
const router = express.Router();
const ofertaController = require('../controllers/ofertaController');
const verifyToken = require('../middlewares/verifyToken');
const requireCompleteProfile = require('../middlewares/requireCompleteProfile');

// 🔐 Rutas protegidas (requieren login Y perfil completo)
router.post('/', verifyToken, requireCompleteProfile, ofertaController.crearOferta);
router.put('/:id', verifyToken, requireCompleteProfile, ofertaController.actualizarOferta);
router.delete('/:id', verifyToken, requireCompleteProfile, ofertaController.eliminarOferta);

// 🔓 Rutas públicas
router.get('/', ofertaController.obtenerOfertas);
router.get('/empresa/:empresaId', verifyToken, ofertaController.obtenerOfertasPorEmpresa);
router.get('/:id', ofertaController.obtenerOfertaPorId);

module.exports = router;
