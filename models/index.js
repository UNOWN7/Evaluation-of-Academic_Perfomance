'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development'; // Use environment variable or default to 'development'
const config = require('../config/config.js')[env]; // Load the environment-specific config
const db = {};

let sequelize;
if (config.use_env_variable) {
  // If using environment variable (e.g., for production)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // For local development/test/prod setup using config.js
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Automatically import all model files in the models directory
fs.readdirSync(__dirname)
  .filter(file => {
    // Filter out files that are not .js or the current index.js file
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // Import each model
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`✅ Successfully imported model: ${model.name}`);
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`🔗 Associations set for model: ${modelName}`);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
