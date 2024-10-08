// models/student.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Student name cannot be empty',
        },
      },
    },
    rollNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Roll number must be unique',
      },
      validate: {
        notEmpty: {
          msg: 'Roll number cannot be empty',
        },
      },
    },
    classId: { // Assuming students belong to classes
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'classes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'students',
    timestamps: true,
  });

  Student.associate = function(models) {
    // A Student belongs to one Class
    Student.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'Class',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // A Student has many StudentSubjectMarks
    Student.hasMany(models.StudentSubjectMark, {
      foreignKey: 'studentId',
      as: 'StudentSubjectMarks',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Student;
};
