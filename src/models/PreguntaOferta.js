// src/models/PreguntaOferta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PreguntaOferta', {
    ofertaId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'FK a Oferta'
    },
    pregunta: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: 'Texto de la pregunta'
    },
    tipo: {
      type: DataTypes.ENUM('test', 'abierta'),
      allowNull: false,
      defaultValue: 'abierta',
      comment: 'Tipo de pregunta: test (opciones) o abierta (texto libre)'
    },
    opciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string con opciones para preguntas tipo test'
    },
    requerida: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si la pregunta es obligatoria'
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Orden de presentación de la pregunta'
    }
  });
};
