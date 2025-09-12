// src/services/uploadService.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// Configuración de almacenamiento para diferentes tipos de archivos
const createCloudinaryStorage = (folderPath) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderPath,
      resource_type: 'auto', // auto, image, video, raw
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      use_filename: true,
      unique_filename: true,
    },
  });
};

// Configuraciones específicas por tipo
const storageConfigs = {
  // Fotos de perfil de estudiantes
  fotosPerfil: createCloudinaryStorage('protalent/estudiantes/fotos-perfil'),
  
  // Logos de empresas
  logos: createCloudinaryStorage('protalent/empresas/logos'),
  
  // CVs de estudiantes
  cvs: createCloudinaryStorage('protalent/estudiantes/cvs'),
  
  // Documentos de ofertas
  ofertasDocs: createCloudinaryStorage('protalent/ofertas/documentos'),
  
  // Documentos de postulaciones
  postulacionesDocs: createCloudinaryStorage('protalent/postulaciones/documentos'),
  
  // Imágenes de blog
  blogImages: createCloudinaryStorage('protalent/blog/imagenes'),
  
  // Documentos generales
  general: createCloudinaryStorage('protalent/general')
};

// Crear middleware de multer para cada tipo
const uploadMiddlewares = {};
Object.keys(storageConfigs).forEach(key => {
  uploadMiddlewares[key] = multer({ 
    storage: storageConfigs[key],
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: (req, file, cb) => {
      // Validaciones adicionales si es necesario
      if (key === 'fotosPerfil' || key === 'logos' || key === 'blogImages') {
        // Solo imágenes para fotos de perfil, logos y blog
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten imágenes para este tipo de archivo'), false);
        }
      } else {
        // Cualquier tipo de archivo para documentos
        cb(null, true);
      }
    }
  });
});

// Middleware genérico
const upload = multer({
  storage: storageConfigs.general,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

module.exports = {
  upload,
  uploadMiddlewares,
  storageConfigs
};
