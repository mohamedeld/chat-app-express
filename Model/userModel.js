const {Sequelize,DataTypes} = require("sequelize");
const  sequelize  = require("../database/sequalize");

const User = sequelize.define('User',{
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  }
})

module.exports = User;