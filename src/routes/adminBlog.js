const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary').cloudinary;
const { 
  getBlogPosts, 
  getBlogPostById, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  getBlogPostStats
} = require('../controllers/adminBlogController');

// Configuración de Cloudinary Storage para imágenes de blog
const blogImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'protalent/blog-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 630, crop: 'fill', quality: 'auto' }
    ]
  }
});

const uploadBlogImage = multer({ 
  storage: blogImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

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

// Rutas CRUD para blog posts
router.get('/', verifyAdminToken, getBlogPosts);                                      // GET /api/admin/blog-posts
router.get('/stats', verifyAdminToken, getBlogPostStats);                             // GET /api/admin/blog-posts/stats
router.get('/:id', verifyAdminToken, getBlogPostById);                                // GET /api/admin/blog-posts/:id
router.post('/', verifyAdminToken, uploadBlogImage.single('imagenPortada'), createBlogPost);        // POST /api/admin/blog-posts
router.put('/:id', verifyAdminToken, uploadBlogImage.single('imagenPortada'), updateBlogPost);      // PUT /api/admin/blog-posts/:id
router.delete('/:id', verifyAdminToken, deleteBlogPost);                              // DELETE /api/admin/blog-posts/:id

module.exports = router;
