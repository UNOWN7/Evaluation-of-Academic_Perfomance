'use strict';

module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Teacher name cannot be empty',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email address must be unique',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: {
          msg: 'Phone number must contain only digits',
        },
        len: {
          args: [10, 15],
          msg: 'Phone number must be between 10 and 15 digits',
        },
      },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: { // Store password in plain text
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty',
        },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long',
        },
      },
    },
  }, {
    tableName: 'teachers',
    timestamps: true,
  });

  Teacher.associate = function(models) {
    // A Teacher has many Classes
    Teacher.hasMany(models.Class, {
      foreignKey: 'teacherId',
      as: 'Classes',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return Teacher;
};
