'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('teachers', [{
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      department: 'Mathematics',
      password: 'password123', // Plain text password
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teachers', { email: 'john.doe@example.com' }, {});
  }
};
