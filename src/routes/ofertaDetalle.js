const express = require('express');
const router = express.Router();
const { 
  obtenerDetalleOferta, 
  obtenerAnalyticsOferta, 
  obtenerInsightsIA 
} = require('../controllers/ofertaDetalleController');
const verifyToken = require('../middlewares/verifyToken');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route GET /api/ofertas/:ofertaId/detalle
 * @desc Obtener detalles completos de una oferta con todas sus relaciones
 * @access Private (Solo empresa propietaria)
 */
router.get('/:ofertaId/detalle', obtenerDetalleOferta);

/**
 * @route GET /api/ofertas/:ofertaId/analytics
 * @desc Obtener métricas y analytics de una oferta específica
 * @access Private (Solo empresa propietaria)
 */
router.get('/:ofertaId/analytics', obtenerAnalyticsOferta);

/**
 * @route GET /api/ofertas/:ofertaId/insights
 * @desc Obtener insights de IA para una oferta (preparado para implementación futura)
 * @access Private (Solo empresa propietaria)
 */
router.get('/:ofertaId/insights', obtenerInsightsIA);

module.exports = router;