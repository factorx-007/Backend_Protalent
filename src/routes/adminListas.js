const express = require('express');
const router = express.Router();
const { getEmpresas, getOfertas, getPostulaciones } = require('../controllers/adminListasController');

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

// Rutas para listas administrativas
router.get('/empresas', verifyAdminToken, getEmpresas);
router.get('/ofertas', verifyAdminToken, getOfertas);
router.get('/postulaciones', verifyAdminToken, getPostulaciones);

module.exports = router;
