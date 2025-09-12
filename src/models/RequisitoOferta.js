// src/models/RequisitoOferta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('RequisitoOferta', {
    ofertaId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'FK a Oferta'
    },
    descripcion: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: 'Texto del requisito'
    },
    tipo: {
      type: DataTypes.ENUM('obligatorio', 'deseable'),
      allowNull: false,
      defaultValue: 'obligatorio',
      comment: 'Si el requisito es obligatorio o deseable'
    },
    categoria: {
      type: DataTypes.ENUM('educacion', 'experiencia', 'habilidad', 'herramienta', 'disponibilidad', 'otro'),
      allowNull: false,
      defaultValue: 'otro',
      comment: 'Categoría del requisito para mejor organización'
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Orden de presentación del requisito'
    }
  });
};
