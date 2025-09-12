const express = require('express');
const router = express.Router();
const { 
  getUsuarios, 
  createAdmin, 
  updateUsuario, 
  deleteUsuario, 
  getUsuariosStats,
  exportUsuarios
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
    const { Usuario } = require('../models');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await Usuario.findByPk(decoded.id);
    if (!user || user.rol !== 'admin') {
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
router.get('/export', verifyAdminToken, exportUsuarios);
router.get('/', verifyAdminToken, getUsuarios);
router.post('/admin', verifyAdminToken, createAdmin);
router.put('/:id', verifyAdminToken, updateUsuario);
router.delete('/:id', verifyAdminToken, deleteUsuario);

module.exports = router;
