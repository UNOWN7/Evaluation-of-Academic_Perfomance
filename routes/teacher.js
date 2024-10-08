// routes/teacher.js

const express = require('express');
const router = express.Router();
const { Teacher, Class, Student, Subject, StudentSubjectMark, Course } = require('../models'); // Ensure Course is imported
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /teacher/login - Render login page
router.get('/login', (req, res) => {
  res.render('teacher/login', { message: null });
});

// POST /teacher/login - Handle login
router.post('/login',
  // Validate input
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { email, password } = req.body;

    if (!errors.isEmpty()) {
      // Return validation errors
      return res.render('teacher/login', { message: errors.array()[0].msg });
    }

    try {
      const teacher = await Teacher.findOne({ where: { email } });

      if (!teacher) {
        return res.render('teacher/login', { message: 'Invalid email or password.' });
      }

      // Compare plain text passwords
      if (teacher.password !== password) {
        return res.render('teacher/login', { message: 'Invalid email or password.' });
      }

      // Set teacherId in cookie for session tracking
      res.cookie('teacherId', teacher.id, { httpOnly: true });
      res.redirect('/teacher/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

// GET /teacher/logout - Handle logout
router.get('/logout', (req, res) => {
  res.clearCookie('teacherId');
  res.redirect('/teacher/login');
});

// GET /teacher/dashboard - Render dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { teacherId: req.teacher.id },
      include: [
        {
          model: Student,
          as: 'Students',
          include: [
            {
              model: StudentSubjectMark,
              as: 'StudentSubjectMarks',
              include: [
                {
                  model: Subject,
                  as: 'Subject',
                },
              ],
            },
          ],
        },
        {
          model: Course, // Correct model to include
          as: 'Course',  // Ensure this matches the alias in your association
          include: [
            {
              model: Subject,
              as: 'Subjects', // Ensure this matches the alias in your association
            },
          ],
        },
      ],
    });

    res.render('teacher/dashboard', { teacher: req.teacher, classes });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /teacher/add-marks/:studentId - Render add/update marks form
router.get('/add-marks/:studentId', authMiddleware, async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findByPk(studentId, {
      include: [
        {
          model: StudentSubjectMark,
          as: 'StudentSubjectMarks',
          include: [
            {
              model: Subject,
              as: 'Subject',
            },
          ],
        },
      ],
    });

    if (!student) {
      return res.status(404).send('Student not found.');
    }

    res.render('teacher/add-marks', { teacher: req.teacher, student });
  } catch (error) {
    console.error('Add Marks error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /teacher/add-marks/:studentId - Handle adding/updating marks
router.post('/add-marks/:studentId',
  authMiddleware,
  // Validate input
  [
    body().custom((value, { req }) => {
      // Iterate over the request body to validate each set of marks
      for (let key in req.body) {
        if (key.startsWith('marksInternal_') || key.startsWith('marksExternal_') || key.startsWith('marksPractical_')) {
          const mark = parseInt(req.body[key], 10);
          if (isNaN(mark) || mark < 0 || mark > 100) {
            throw new Error('Marks must be integers between 0 and 100.');
          }
        }
      }
      return true;
    }),
  ],
  async (req, res) => {
    const { studentId } = req.params;
    const body = req.body;

    try {
      // Fetch the student with their StudentSubjectMarks and Subjects
      const student = await Student.findByPk(studentId, {
        include: [
          {
            model: StudentSubjectMark,
            as: 'StudentSubjectMarks',
            include: [
              {
                model: Subject,
                as: 'Subject',
              },
            ],
          },
        ],
      });

      if (!student) {
        return res.status(404).send('Student not found.');
      }

      // Iterate over each StudentSubjectMark to update marks
      for (const mark of student.StudentSubjectMarks) {
        const subjectId = mark.Subject.id;
        const marksInternal = body[`marksInternal_${subjectId}`];
        const marksExternal = body[`marksExternal_${subjectId}`];
        const marksPractical = body[`marksPractical_${subjectId}`];
        const subjectIdHidden = body[`subjectId_${subjectId}`];

        if (parseInt(subjectIdHidden, 10) !== subjectId) {
          // Subject ID mismatch
          continue; // or handle error accordingly
        }

        // Update marks
        mark.marksInternal = marksInternal;
        mark.marksExternal = marksExternal;
        mark.marksPractical = marksPractical;
        mark.teacherId = req.teacher.id; // Assign current teacher
        await mark.save();
      }

      res.redirect('/teacher/dashboard');
    } catch (error) {
      console.error('Add/Update Marks error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
