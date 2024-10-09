

module.exports = {
  development: {
    username: 'root',
    password: 'root',
    database: 'testing',
    host: 'localhost',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: 'root',
    database: 'testing_test',
    host: 'localhost',
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
  },
};

require('dotenv').config(); // Load .env file

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT, // Loaded from .env
});

module.exports = sequelize;
