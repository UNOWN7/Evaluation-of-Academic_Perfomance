// models/course.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Course name cannot be empty',
        },
      },
    },
  }, {
    tableName: 'courses',
    timestamps: true,
  });

  Course.associate = function(models) {
    // A Course has many Subjects
    Course.hasMany(models.Subject, {
      foreignKey: 'courseId',
      as: 'Subjects',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
   
    // A Course has many Classes
    Course.hasMany(models.Class, {
      foreignKey: 'courseId',
      as: 'Classes',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    Course.hasMany(models.Subject, { foreignKey: 'courseId', as: 'subjects' });

    
  };

  return Course;
};
