const express = require('express');
const router = express.Router();
const empresaDashboardController = require('../controllers/empresaDashboardController');
const verifyToken = require('../middlewares/verifyToken');

// Todas las rutas requieren autenticación
router.get('/estadisticas', verifyToken, empresaDashboardController.obtenerEstadisticasDashboard);
router.get('/actividad', verifyToken, empresaDashboardController.obtenerActividadReciente);

module.exports = router;
