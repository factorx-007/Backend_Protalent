const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const verifyToken = require('../middlewares/verifyToken');

// ✅ Requiere login:
router.post('/', verifyToken, empresaController.crearEmpresa);
router.put('/:id', verifyToken, empresaController.actualizarEmpresa);
router.delete('/:id', verifyToken, empresaController.eliminarEmpresa);

// 🔓 Públicos:
router.get('/', empresaController.obtenerEmpresas);
router.get('/:id', empresaController.obtenerEmpresaPorId);
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { Empresa } = require('../models');
    const empresa = await Empresa.findOne({ where: { usuarioId } });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada para este usuario' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar empresa por usuario', detalle: error.message });
  }
});

module.exports = router;
