const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPostController');
const verifyToken = require('../middlewares/verifyToken');
const uploadService = require('../services/uploadService');

// Protegidas
router.post('/', verifyToken, blogPostController.crearPost);
router.put('/:id', verifyToken, blogPostController.actualizarPost);
router.delete('/:id', verifyToken, blogPostController.eliminarPost);

// Media
router.post('/:id/media', verifyToken, uploadService.uploadMiddlewares.blogImages.single('imagen'), blogPostController.agregarMedia);
router.get('/:id/media', blogPostController.obtenerMedia);
// Reacciones
router.post('/:id/reaccion', verifyToken, blogPostController.reaccionar);
router.get('/:id/reacciones', blogPostController.obtenerReacciones);
router.get('/:postId/reactions', blogPostController.obtenerReaccionesPost); // NUEVO ENDPOINT

// Públicas
router.get('/', blogPostController.obtenerPosts);
router.get('/categoria/:categoriaId', blogPostController.obtenerPostsPorCategoria); // NUEVO ENDPOINT
router.get('/:id', blogPostController.obtenerPostPorId);

module.exports = router;
