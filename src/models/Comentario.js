const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Comentario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    blogPostId: { type: DataTypes.INTEGER, allowNull: false },
    autorId: { type: DataTypes.INTEGER, allowNull: true },
    autorTipo: { type: DataTypes.ENUM('usuario', 'empresa', 'admin'), allowNull: true },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
};
