// src/routes/estudiante.js
const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const verifyToken = require('../middlewares/verifyToken');

// 🔐 Rutas protegidas (requieren login)
router.post('/', verifyToken, estudianteController.crearEstudiante);
router.put('/:id', verifyToken, estudianteController.actualizarEstudiante);
router.delete('/:id', verifyToken, estudianteController.eliminarEstudiante);

// 🔓 Rutas públicas
router.get('/', estudianteController.obtenerEstudiantes);
router.get('/:id', estudianteController.obtenerEstudiantePorId);

module.exports = router;
