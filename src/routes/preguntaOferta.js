// src/routes/preguntaOferta.js
const express = require('express');
const router = express.Router();
const preguntaOfertaController = require('../controllers/preguntaOfertaController');
const verifyToken = require('../middlewares/verifyToken');

// 🔐 Rutas protegidas (solo empresas)
router.post('/', verifyToken, preguntaOfertaController.crearPregunta);
router.put('/:id', verifyToken, preguntaOfertaController.actualizarPregunta);
router.delete('/:id', verifyToken, preguntaOfertaController.eliminarPregunta);

// 🔓 Rutas públicas
router.get('/oferta/:ofertaId', preguntaOfertaController.obtenerPreguntasPorOferta);

module.exports = router;
