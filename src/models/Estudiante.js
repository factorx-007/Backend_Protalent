// src/models/Estudiante.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Estudiante', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false },
    carrera: { type: DataTypes.STRING, allowNull: false },
    anioIngreso: { type: DataTypes.INTEGER, allowNull: true },
    anio_egreso: { type: DataTypes.INTEGER, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    tipo: { type: DataTypes.STRING, allowNull: true },
    cv: { type: DataTypes.STRING, allowNull: true },
    foto_perfil: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
};
