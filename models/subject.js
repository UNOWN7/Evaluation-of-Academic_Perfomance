// models/subject.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Subject name cannot be empty',
        },
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allows NULL to align with ON DELETE SET NULL
      references: {
        model: 'courses', // Must match the table name in lowercase
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'subjects',
    timestamps: true,
  });

  Subject.associate = function(models) {
    // A Subject belongs to one Course
    Subject.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'Course',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // A Subject has many StudentSubjectMarks
    Subject.hasMany(models.StudentSubjectMark, {
      foreignKey: 'subjectId',
      as: 'StudentSubjectMarks',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });    
    Subject.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
  };

  return Subject;
};
