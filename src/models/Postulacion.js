// src/models/Postulacion.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Postulacion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mensaje: { type: DataTypes.TEXT },
    estado: {
      type: DataTypes.ENUM('pendiente', 'revisada', 'aceptada', 'rechazada'),
      defaultValue: 'pendiente',
    },
    estudianteId: { type: DataTypes.INTEGER, allowNull: false },
    ofertaId: { type: DataTypes.INTEGER, allowNull: false },
    cvUrl: { 
      type: DataTypes.STRING(500), 
      allowNull: true,
      comment: 'URL del CV en Cloudinary'
    },
    cartaUrl: { 
      type: DataTypes.STRING(500), 
      allowNull: true,
      comment: 'URL de la carta de presentación en Cloudinary'
    },
    comentarios: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Comentarios de la empresa sobre la postulación'
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
      comment: 'Puntuación de 1 a 5 estrellas'
    },
    recomendacion: {
      type: DataTypes.ENUM('altamente_recomendado', 'recomendado', 'neutral', 'no_recomendado'),
      allowNull: true,
      comment: 'Recomendación de la empresa'
    },
    fechaEvaluacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha cuando se evaluó la postulación'
    },
    evaluadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del usuario que evaluó la postulación'
    },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
};
