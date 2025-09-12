const sequelize = require('../config/db');

// Importación de modelos
const UsuarioModel = require('./Usuario');
const EstudianteModel = require('./Estudiante');
const EmpresaModel = require('./Empresa');
const OfertaModel = require('./Oferta');
const RequisitoOfertaModel = require('./RequisitoOferta');
const PostulacionModel = require('./Postulacion');
const PreguntaOfertaModel = require('./PreguntaOferta');
const RespuestaPostulacionModel = require('./RespuestaPostulacion');
const CategoriaModel = require('./Categoria');
const BlogPostModel = require('./BlogPost');
const ComentarioModel = require('./Comentario');
const BlogPostMedia = require('./BlogPostMedia')(sequelize);
const BlogPostReaction = require('./BlogPostReaction')(sequelize);
const ComentarioMedia = require('./ComentarioMedia')(sequelize);
const ComentarioReaction = require('./ComentarioReaction')(sequelize);

// Inicialización
const Usuario = UsuarioModel(sequelize);
const Estudiante = EstudianteModel(sequelize);
const Empresa = EmpresaModel(sequelize);
const Oferta = OfertaModel(sequelize);
const RequisitoOferta = RequisitoOfertaModel(sequelize);
const Postulacion = PostulacionModel(sequelize);
const PreguntaOferta = PreguntaOfertaModel(sequelize);
const RespuestaPostulacion = RespuestaPostulacionModel(sequelize);
const Categoria = CategoriaModel(sequelize);
const BlogPost = BlogPostModel(sequelize);
const Comentario = ComentarioModel(sequelize);

// Relaciones del sistema principal
Usuario.hasOne(Estudiante, { foreignKey: 'usuarioId' });
Estudiante.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Usuario.hasOne(Empresa, { foreignKey: 'usuarioId' });
Empresa.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Empresa.hasMany(Oferta, { foreignKey: 'empresaId' });
Oferta.belongsTo(Empresa, { foreignKey: 'empresaId' });

// ✅ NUEVAS RELACIONES: Requisitos de Oferta
Oferta.hasMany(RequisitoOferta, { foreignKey: 'ofertaId' });
RequisitoOferta.belongsTo(Oferta, { foreignKey: 'ofertaId' });

// ✅ CAMBIO: Ahora Estudiante tiene las postulaciones (no Usuario)
Estudiante.hasMany(Postulacion, { foreignKey: 'estudianteId' });
Postulacion.belongsTo(Estudiante, { foreignKey: 'estudianteId' });

Oferta.hasMany(Postulacion, { foreignKey: 'ofertaId' });
Postulacion.belongsTo(Oferta, { foreignKey: 'ofertaId' });

// ✅ NUEVAS RELACIONES: Sistema de Preguntas y Respuestas
Oferta.hasMany(PreguntaOferta, { foreignKey: 'ofertaId' });
PreguntaOferta.belongsTo(Oferta, { foreignKey: 'ofertaId' });

Postulacion.hasMany(RespuestaPostulacion, { foreignKey: 'postulacionId' });
RespuestaPostulacion.belongsTo(Postulacion, { foreignKey: 'postulacionId' });

PreguntaOferta.hasMany(RespuestaPostulacion, { foreignKey: 'preguntaOfertaId' });
RespuestaPostulacion.belongsTo(PreguntaOferta, { foreignKey: 'preguntaOfertaId' });

// Relaciones del blog
Categoria.hasMany(BlogPost, { foreignKey: 'categoriaId', onDelete: 'CASCADE' });
BlogPost.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// BlogPost y Multimedia
BlogPost.hasMany(BlogPostMedia, { foreignKey: 'blogPostId', onDelete: 'CASCADE' });
BlogPostMedia.belongsTo(BlogPost, { foreignKey: 'blogPostId' });

// BlogPost y Reacciones
BlogPost.hasMany(BlogPostReaction, { foreignKey: 'blogPostId', onDelete: 'CASCADE' });
BlogPostReaction.belongsTo(BlogPost, { foreignKey: 'blogPostId' });

// BlogPost y Comentarios
BlogPost.hasMany(Comentario, { foreignKey: 'blogPostId', onDelete: 'CASCADE' });
Comentario.belongsTo(BlogPost, { foreignKey: 'blogPostId' });

// Comentario y Multimedia
Comentario.hasMany(ComentarioMedia, { foreignKey: 'comentarioId', onDelete: 'CASCADE' });
ComentarioMedia.belongsTo(Comentario, { foreignKey: 'comentarioId' });

// Comentario y Reacciones
Comentario.hasMany(ComentarioReaction, { foreignKey: 'comentarioId', onDelete: 'CASCADE' });
ComentarioReaction.belongsTo(Comentario, { foreignKey: 'comentarioId' });

// Comentarios anidados (respuestas)
Comentario.hasMany(Comentario, { as: 'respuestas', foreignKey: 'parentId', onDelete: 'CASCADE' });
Comentario.belongsTo(Comentario, { as: 'padre', foreignKey: 'parentId' });

module.exports = {
  sequelize,
  Usuario,
  Estudiante,
  Empresa,
  Oferta,
  RequisitoOferta,
  Postulacion,
  PreguntaOferta,
  RespuestaPostulacion,
  Categoria,
  BlogPost,
  Comentario,
  BlogPostMedia,
  BlogPostReaction,
  ComentarioMedia,
  ComentarioReaction
};
