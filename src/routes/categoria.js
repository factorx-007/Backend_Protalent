const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const verifyToken = require('../middlewares/verifyToken');

// Protegidas
router.post('/', verifyToken, categoriaController.crearCategoria);
router.put('/:id', verifyToken, categoriaController.actualizarCategoria);
router.delete('/:id', verifyToken, categoriaController.eliminarCategoria);

// Públicas
router.get('/', categoriaController.obtenerCategorias);
router.get('/:id', categoriaController.obtenerCategoriaPorId);

module.exports = router;
