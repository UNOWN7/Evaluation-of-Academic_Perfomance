'use strict';

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address.'
        },
        notEmpty: {
          msg: 'Email cannot be empty.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 20],
          msg: 'Password must be between 6 and 20 characters long.'
        },
        notEmpty: {
          msg: 'Password cannot be empty.'
        }
      }
    }
  }, {
    tableName: 'admins',
    timestamps: true
  });

  return Admin;
};
