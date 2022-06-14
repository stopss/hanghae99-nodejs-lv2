'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {

    static associate(models) {
      // models.Posts.hasMany(models.Post, {foreignKey: "postId", targetKey: "postId"})
      // models.Posts.belongsTo(models.User, {foreignKey: "userId", targetKey: "userId"})
    }
  }
  Posts.init({
    postId: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    image: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    layout: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Posts',
  });
  // Post.belongsTo(User);
  // Post.hasMany(Like);

  return Posts;
};