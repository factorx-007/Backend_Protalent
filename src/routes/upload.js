// src/routes/upload.js
const express = require('express');
const router = express.Router();
const { 
  upload, 
  subirArchivo, 
  subirArchivoPostulacion,
  obtenerUrlDescarga,
  descargarArchivo
} = require('../controllers/uploadController');
const verifyToken = require('../middlewares/verifyToken');

// Rutas públicas para descarga
router.get('/download/:publicId', descargarArchivo);
router.get('/url/:publicId', obtenerUrlDescarga);

// Rutas protegidas para subida
router.post('/', verifyToken, upload.single('archivo'), subirArchivo);
router.post('/postulacion', verifyToken, upload.single('archivo'), subirArchivoPostulacion);

module.exports = router;
