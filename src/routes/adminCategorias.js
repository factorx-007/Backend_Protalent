const express = require('express');
const router = express.Router();
const { 
  getCategorias, 
  getCategoriaById, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria 
} = require('../controllers/adminCategoriasController');

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

// Rutas CRUD para categorías
router.get('/', verifyAdminToken, getCategorias);           // GET /api/admin/categorias
router.get('/:id', verifyAdminToken, getCategoriaById);     // GET /api/admin/categorias/:id
router.post('/', verifyAdminToken, createCategoria);        // POST /api/admin/categorias
router.put('/:id', verifyAdminToken, updateCategoria);      // PUT /api/admin/categorias/:id
router.delete('/:id', verifyAdminToken, deleteCategoria);   // DELETE /api/admin/categorias/:id

module.exports = router;
