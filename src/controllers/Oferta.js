// src/models/Oferta.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Oferta = sequelize.define('Oferta', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  requisitos: { type: DataTypes.TEXT },
  duracion: { type: DataTypes.STRING },
  requiereCV: { type: DataTypes.BOOLEAN, defaultValue: true },
  requiereCarta: { type: DataTypes.BOOLEAN, defaultValue: false },
  empresaId: { type: DataTypes.INTEGER, allowNull: false }, // FK
});

module.exports = Oferta;
