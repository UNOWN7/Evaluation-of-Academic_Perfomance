// models/class.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Class name cannot be empty',
        },
      },
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
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'classes',
    timestamps: true,
  });

  Class.associate = function(models) {
    // A Class belongs to one Course
    Class.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'Course',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // A Class belongs to one Teacher
    Class.belongsTo(models.Teacher, {
      foreignKey: 'teacherId',
      as: 'Teacher',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // A Class has many Students
    Class.hasMany(models.Student, {
      foreignKey: 'classId',
      as: 'Students',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Class;
};
