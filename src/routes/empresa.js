const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const verifyToken = require('../middlewares/verifyToken');
const { prisma } = require('../config/database');

// ✅ Requiere login:
router.post('/', verifyToken, empresaController.crearEmpresa);
router.put('/:id', verifyToken, empresaController.actualizarEmpresa);
router.delete('/:id', verifyToken, empresaController.eliminarEmpresa);

// Rutas específicas para el perfil de empresa del usuario autenticado
router.get('/perfil', verifyToken, empresaController.obtenerPerfilEmpresa);
router.put('/perfil', verifyToken, empresaController.actualizarPerfilEmpresa);

// 🔓 Públicos:
router.get('/', empresaController.obtenerEmpresas);
router.get('/:id', empresaController.obtenerEmpresaPorId);
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const empresa = await prisma.empresa.findUnique({ 
      where: { usuarioId: parseInt(usuarioId) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada para este usuario' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar empresa por usuario', detalle: error.message });
  }
});

module.exports = router;
