const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('BlogPost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    autorId: { type: DataTypes.INTEGER, allowNull: false },
    autorTipo: { type: DataTypes.ENUM('usuario', 'empresa', 'admin'), allowNull: false },
    categoriaId: { type: DataTypes.INTEGER, allowNull: true },
    compartidos: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
};
