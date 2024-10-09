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

// Function to safely import models
const importModel = (modelName) => {
  try {
    db[modelName] = require(`./${modelName}`)(sequelize, Sequelize.DataTypes);
    console.log(`✅ Successfully imported model: ${modelName}`);
  } catch (error) {
    console.error(`❌ Failed to import model: ${modelName}`);
    console.error(error);
    db[modelName] = undefined;
  }
};

// List of model names as per your setup
const modelNames = ['Course', 'Teacher', 'Class', 'Student', 'Subject', 'StudentSubjectMark', 'Admin'];

// Import all models
modelNames.forEach((modelName) => {
  importModel(modelName);
});

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`🔗 Associations set for model: ${modelName}`);
  } else {
    if (!db[modelName]) {
      console.warn(`⚠️ Model ${modelName} is undefined. Skipping associations.`);
    } else {
      console.warn(`⚠️ Model ${modelName} does not have an associate method.`);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
