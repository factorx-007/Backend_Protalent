// src/controllers/uploadController.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { Usuario, Estudiante, Empresa, BlogPost } = require('../models');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar storage para diferentes tipos de archivos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'protalent',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Subir archivo
const subirArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    res.json({
      mensaje: 'Archivo subido exitosamente',
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error al subir archivo', detalle: error.message });
  }
};

// Subir archivo de postulación
const subirArchivoPostulacion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { tipo } = req.body; // 'cv' o 'carta'
    
    // Crear carpeta específica para postulaciones
    const folder = `postulaciones/${tipo}`;
    
    // Subir a Cloudinary con carpeta específica
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folder,
      resource_type: 'auto'
    });

    res.json({
      mensaje: 'Archivo subido exitosamente',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error al subir archivo de postulación:', error);
    res.status(500).json({ error: 'Error al subir archivo', detalle: error.message });
  }
};

// Obtener URL de descarga de archivo
const obtenerUrlDescarga = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID requerido' });
    }

    // Generar URL firmada para descarga
    const url = cloudinary.url(publicId, {
      sign_url: true,
      type: 'private',
      flags: 'attachment'
    });

    res.json({
      url: url
    });
  } catch (error) {
    console.error('Error al obtener URL de descarga:', error);
    res.status(500).json({ error: 'Error al obtener URL de descarga', detalle: error.message });
  }
};

// Descargar archivo directamente
const descargarArchivo = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID requerido' });
    }

    // Obtener información del archivo
    const result = await cloudinary.api.resource(publicId);
    
    // Generar URL de descarga
    const downloadUrl = cloudinary.url(publicId, {
      sign_url: true,
      type: 'private',
      flags: 'attachment'
    });

    // Redirigir a la URL de descarga
    res.redirect(downloadUrl);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({ error: 'Error al descargar archivo', detalle: error.message });
  }
};

// Upload de foto de perfil de estudiante
const uploadFotoPerfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se encontró archivo para subir' });
    }

    const userId = req.user.id;
    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    // Encontrar el estudiante del usuario
    const estudiante = await Estudiante.findOne({ where: { usuarioId: userId } });
    if (!estudiante) {
      return res.status(404).json({ error: 'Perfil de estudiante no encontrado' });
    }

    // Actualizar la foto de perfil del estudiante
    await estudiante.update({ foto_perfil: fileUrl });

    res.json({
      mensaje: 'Foto de perfil actualizada correctamente',
      foto_perfil: fileUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error('Error uploading foto perfil:', error);
    res.status(500).json({ error: 'Error al subir foto de perfil' });
  }
};

// Upload de logo de empresa
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se encontró archivo para subir' });
    }

    const userId = req.user.id;
    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    // Encontrar la empresa del usuario
    const empresa = await Empresa.findOne({ where: { usuarioId: userId } });
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Actualizar el logo de la empresa
    await empresa.update({ logo_url: fileUrl });

    res.json({
      mensaje: 'Logo actualizado correctamente',
      logo: fileUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Error al subir logo' });
  }
};

// Upload de CV de estudiante
const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se encontró archivo para subir' });
    }

    const userId = req.user.id;
    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    // Encontrar el estudiante del usuario
    const estudiante = await Estudiante.findOne({ where: { usuarioId: userId } });
    if (!estudiante) {
      return res.status(404).json({ error: 'Perfil de estudiante no encontrado' });
    }

    // Actualizar el CV del estudiante
    await estudiante.update({ cv: fileUrl });

    res.json({
      mensaje: 'CV actualizado correctamente',
      cv: fileUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    res.status(500).json({ error: 'Error al subir CV' });
  }
};

// Upload de imagen para blog post
const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se encontró archivo para subir' });
    }

    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    res.json({
      mensaje: 'Imagen subida correctamente',
      imagen: fileUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error('Error uploading blog image:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
};

// Eliminar archivo
const deleteUploadedFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({
      mensaje: 'Archivo eliminado correctamente',
      result
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
};

module.exports = {
  upload,
  subirArchivo,
  subirArchivoPostulacion,
  obtenerUrlDescarga,
  descargarArchivo,
  uploadFotoPerfil,
  uploadLogo,
  uploadCV,
  uploadBlogImage,
  deleteUploadedFile
};
