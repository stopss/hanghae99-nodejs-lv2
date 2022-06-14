'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {

    static associate(models) {
      // models.Like.belongsTo(models.Post, {foreignKey: "postId", targetKey: "postId"})
      // models.Like.belongsTo(models.User, {foreignKey: "userId", targetKey: "userId"})
    }
  }

  Like.init({
    userId: DataTypes.STRING,
    postId: DataTypes.STRING,
    done: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Like',
  });

  return Like;
};