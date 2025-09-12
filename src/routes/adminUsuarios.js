const express = require('express');
const router = express.Router();
const { 
  getUsuarios, 
  getUsuarioById,
  eliminarUsuario,
  getUsuariosStats,
  buscarUsuarios,
  cambiarRolUsuario
} = require('../controllers/adminUsuariosController');

// Middleware específico para verificar token de admin
const verifyAdminToken = async (req, res, next) => {
  try {
    const adminToken = req.headers['x-admin-authorization'];
    
    if (!adminToken) {
      return res.status(401).json({ error: 'Token de administrador requerido' });
    }

    const token = adminToken.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const { prisma } = require('../config/database');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.usuario.findUnique({ where: { id: decoded.id } });
    if (!user || user.rol !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado - Solo administradores' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token de administrador inválido' });
  }
};

// Rutas para gestión de usuarios
router.get('/stats', verifyAdminToken, getUsuariosStats);
router.get('/search', verifyAdminToken, buscarUsuarios);
router.get('/:id', verifyAdminToken, getUsuarioById);
router.get('/', verifyAdminToken, getUsuarios);
router.put('/:id/rol', verifyAdminToken, cambiarRolUsuario);
router.delete('/:id', verifyAdminToken, eliminarUsuario);

module.exports = router;
