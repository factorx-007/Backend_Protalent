//src/routes/auth.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  googleAuth, 
  completarPerfilEmpresa, 
  verificarEstadoPerfil, 
  perfil, 
  logout,
  obtenerUsuariosPublicos,
  buscarUsuarios
} = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);  // ✅ Google OAuth
router.post('/completar-perfil-empresa', verifyToken, completarPerfilEmpresa); // ✅ Completar perfil empresa
router.get('/verificar-perfil', verifyToken, verificarEstadoPerfil); // ✅ Verificar estado del perfil
router.get('/perfil', verifyToken, perfil);   // ✅ protegida
router.post('/logout', verifyToken, logout);  // ✅ también protegida (opcional)

// Nuevos endpoints públicos para usuarios
router.get('/usuarios-publicos', obtenerUsuariosPublicos); // ✅ Obtener usuarios públicos
router.get('/buscar-usuarios', buscarUsuarios); // ✅ Buscar usuarios

module.exports = router;
