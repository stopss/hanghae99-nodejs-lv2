'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // models.User.hasMany(models.Post, {foreignKey: "userId", targetKey: "postId"})
      // models.User.hasMany(models.Like, {foreignKey: "postId", targetKey: "postId"})
    }
  }
  User.init({
    userId: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    email: DataTypes.STRING,
    nickname: DataTypes.STRING,
    password: DataTypes.STRING,
    admin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });


  // User.hasMany(Post);
  // User.hasMany(Like);

  return User;
};