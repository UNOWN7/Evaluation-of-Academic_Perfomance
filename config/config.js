// config/config.js

const Sequelize = require('sequelize');

// Database credentials
const sequelize = new Sequelize('testing', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  // Disable logging; enable if needed
});
console.log('Database Dialect:', process.env.DB_DIALECT); // or whatever source you're using

module.exports = sequelize;
