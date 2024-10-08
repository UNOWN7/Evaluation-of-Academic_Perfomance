// models/studentsubjectmark.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentSubjectMark = sequelize.define('StudentSubjectMark', {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    marksInternal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    marksExternal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    marksPractical: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    teacherId: { // Make sure to add this line
      type: DataTypes.INTEGER,
      allowNull: true, // Adjust based on your requirements
    },
  
  }, {
    tableName: 'studentsubjectmarks',
    timestamps: false,
  });

  StudentSubjectMark.associate = function(models) {
    // StudentSubjectMark belongs to a Student
    StudentSubjectMark.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'Student',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // StudentSubjectMark belongs to a Subject
    StudentSubjectMark.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'Subject',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return StudentSubjectMark;
};
