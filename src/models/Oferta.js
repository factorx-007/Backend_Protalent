// src/models/Oferta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Oferta', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    requisitos: { type: DataTypes.TEXT },
    modalidad: { type: DataTypes.STRING },
    salario: { type: DataTypes.STRING },
    departamento: { type: DataTypes.STRING },
    provincia: { type: DataTypes.STRING },
    distrito: { type: DataTypes.STRING },
    duracion: { type: DataTypes.STRING },
    requiereCV: { type: DataTypes.BOOLEAN, defaultValue: true },
    requiereCarta: { type: DataTypes.BOOLEAN, defaultValue: false },
    empresaId: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
};
