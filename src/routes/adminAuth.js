// src/routes/adminAuth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// Middleware específico para verificar token de admin
const verifyAdminToken = async (req, res, next) => {
  try {
    const adminToken = req.headers['x-admin-authorization'];
    
    if (!adminToken) {
      return res.status(401).json({ error: 'Token de administrador requerido' });
    }

    const token = adminToken.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
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

// Login específico para admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario con rol admin específicamente
    const user = await prisma.usuario.findUnique({ 
      where: { 
        email
      } 
    });

    if (!user || user.rol !== 'ADMIN') {
      return res.status(404).json({ 
        error: 'Credenciales incorrectas o acceso no autorizado' 
      });
    }

    // Verificar que tenga contraseña (no sea usuario OAuth)
    if (!user.password) {
      return res.status(400).json({ 
        error: 'Este usuario no tiene contraseña configurada' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas o acceso no autorizado' 
      });
    }

    // Generar token específico para admin
    const token = generateToken({ 
      id: user.id, 
      rol: user.rol,
      type: 'admin' // Marcador adicional
    });

    res.json({
      mensaje: 'Login de administrador exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Error al iniciar sesión como administrador', 
      detalle: err.message 
    });
  }
});

// Verificar token de admin
router.get('/verify', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      mensaje: 'Token de administrador válido',
      user: {
        id: req.adminUser.id,
        nombre: req.adminUser.nombre,
        email: req.adminUser.email,
        rol: req.adminUser.rol,
      },
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Error al verificar token de administrador',
      detalle: err.message 
    });
  }
});

module.exports = router;
