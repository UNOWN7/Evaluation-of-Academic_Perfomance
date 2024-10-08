// middleware/auth.js
const { Teacher } = require('../models'); // Adjust the path as necessary


const authMiddleware = async (req, res, next) => {
  const teacherId = req.cookies.teacherId;

  if (!teacherId) {
    return res.redirect('/teacher/login');
  }

  try {
    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.redirect('/teacher/login');
    }

    req.teacher = teacher; // Attach teacher to request object
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.redirect('/teacher/login');
  }
};




module.exports = authMiddleware;
