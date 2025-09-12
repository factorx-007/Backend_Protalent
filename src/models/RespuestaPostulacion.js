// src/models/RespuestaPostulacion.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('RespuestaPostulacion', {
    postulacionId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'FK a Postulacion'
    },
    preguntaOfertaId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'FK a PreguntaOferta'
    },
    respuesta: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: 'Respuesta del postulante'
    }
  });
};
