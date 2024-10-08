// adminAuthMiddleware.js
const { Admin } = require('../models'); // Import the Admin model

// Middleware to check if admin is authenticated
const adminAuthMiddleware = (req, res, next) => {
  // Check if admin is logged in by verifying session or authentication mechanism
  if (req.session && req.session.adminId) {
    return next(); // Proceed to the next middleware or route
  }

  // If not authenticated, redirect to login page
  res.redirect('/admin/login');
};

module.exports = adminAuthMiddleware;
