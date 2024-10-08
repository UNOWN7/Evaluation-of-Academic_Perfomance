// models/index.js

'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/config'); // Import the Sequelize instance

const db = {};

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
const modelNames = ['Course', 'Teacher', 'Class', 'Student', 'Subject', 'StudentSubjectMark','Admin'];

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
