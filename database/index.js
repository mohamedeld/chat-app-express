
const sequelize = require("./sequalize");
require("../Model/userModel")
const dbConnection  = async ()=>{
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = dbConnection;