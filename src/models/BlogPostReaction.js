const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('BlogPostReaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    blogPostId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry'), allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
}; 