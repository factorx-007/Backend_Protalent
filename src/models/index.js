// src/models/index.js - Prisma Models Export
const { prisma } = require('../config/database');

// Exportar prisma y mantener compatibilidad con nombres antiguos
module.exports = {
  // Cliente de Prisma
  prisma,
  
  // Compatibilidad con nombres antiguos (para migración gradual)
  Usuario: prisma.usuario,
  Estudiante: prisma.estudiante,
  Empresa: prisma.empresa,
  Oferta: prisma.oferta,
  RequisitoOferta: prisma.requisitoOferta,
  Postulacion: prisma.postulacion,
  PreguntaOferta: prisma.preguntaOferta,
  RespuestaPostulacion: prisma.respuestaPostulacion,
  Categoria: prisma.categoria,
  BlogPost: prisma.blogPost,
  Comentario: prisma.comentario,
  BlogPostMedia: prisma.blogPostMedia,
  BlogPostReaction: prisma.blogPostReaction,
  ComentarioMedia: prisma.comentarioMedia,
  ComentarioReaction: prisma.comentarioReaction
};