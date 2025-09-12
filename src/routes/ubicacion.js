const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');

// Obtener todos los departamentos
router.get('/departamentos', ubicacionController.obtenerDepartamentos);

// Obtener provincias de un departamento
router.get('/provincias/:departamentoId', ubicacionController.obtenerProvincias);

// Obtener distritos de una provincia
router.get('/distritos/:provinciaId', ubicacionController.obtenerDistritos);

module.exports = router; 