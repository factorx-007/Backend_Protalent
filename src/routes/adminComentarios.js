const express = require('express');
const router = express.Router();
const { 
  getComentarios, 
  getComentarioById, 
  deleteComentario,
  getComentarioStats
} = require('../controllers/adminComentariosController');

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
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Rutas para comentarios
router.get('/', verifyAdminToken, getComentarios);              // GET /api/admin/comentarios
router.get('/stats', verifyAdminToken, getComentarioStats);     // GET /api/admin/comentarios/stats
router.get('/:id', verifyAdminToken, getComentarioById);        // GET /api/admin/comentarios/:id
router.delete('/:id', verifyAdminToken, deleteComentario);      // DELETE /api/admin/comentarios/:id

module.exports = router;
