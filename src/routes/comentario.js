const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const verifyToken = require('../middlewares/verifyToken');
const uploadService = require('../services/uploadService');

// Protegidas
router.post('/', verifyToken, comentarioController.crearComentario);
router.put('/:id', verifyToken, comentarioController.actualizarComentario);
router.delete('/:id', verifyToken, comentarioController.eliminarComentario);

// Públicas
router.get('/', comentarioController.obtenerComentarios);
router.get('/:id', comentarioController.obtenerComentarioPorId);

// Obtener comentarios anidados de un post
router.get('/post/:blogPostId/anidados', comentarioController.obtenerComentariosAnidados);

// Media
router.post('/:id/media', verifyToken, uploadService.uploadMiddlewares.blogImages.single('imagen'), comentarioController.agregarMedia);
router.get('/:id/media', comentarioController.obtenerMedia);
// Reacciones
router.post('/:id/reaccion', verifyToken, comentarioController.reaccionar);
router.get('/:id/reacciones', comentarioController.obtenerReacciones);

module.exports = router;
