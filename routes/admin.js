// routes/admin.js

const express = require('express');
const router = express.Router();
const { Class, Student, Course, Teacher, Subject, StudentSubjectMark, Admin ,sequelize } = require('../models');
const { body, validationResult } = require('express-validator');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
// Render the Admin Dashboard
// routes/admin.js

router.get('/login', (req, res) => {
  res.render('admin_login', { error: null });
});

// POST Admin Login

// Admin Login POST route with validation
router.post(
  '/login',
  [
    // Validation rules using express-validator
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, return errors
      return res.render('admin_login', { errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find the admin by email
      const admin = await Admin.findOne({ where: { email } });

      if (!admin) {
        return res.render('admin_login', { error: 'Invalid email or password' });
      }

      // Password checking can be done here. If bcrypt was used, compare passwords here.
      if (password !== admin.password) {
        return res.render('admin_login', { error: 'Invalid email or password' });
      }

      // Set session after successful login
      req.session.adminId = admin.id; // Store admin ID in session

      // Redirect to admin dashboard
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

// Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Render the Admin Dashboard
router.get('/dashboard',adminAuthMiddleware, async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [
        { model: Course, as: 'Course' }, // As defined in Class.associate
        { model: Teacher, as: 'Teacher' }, // As defined in Class.associate
        { model: Student, as: 'Students' }// As defined in Class.associate
      ],
    });

    const courses = await Course.findAll({
      include: [
        { model: Subject, as: 'Subjects' }, // Correct alias: 'Subjects'
      ],
    });

    const teachers = await Teacher.findAll();
    
    const subjects = await Subject.findAll({
      include: [
        { model: Course, as: 'Course' }, // Correct alias: 'Course'
      ],
    });
  



    res.render('admin_dashboard', { classes, courses, teachers, subjects });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Create a New Teacher
router.post('/create-teacher', async (req, res) => {
  const { teacherName, teacherEmail, teacherPhone, teacherDepartment,teacherPassword } = req.body;
  console.log('Creating teacher:', { teacherName, teacherEmail, teacherPhone, teacherDepartment,teacherPassword });

  try {
    // Check for existing email
    const existingTeacher = await Teacher.findOne({ where: { email: teacherEmail } });
    if (existingTeacher) {
      const classes = await Class.findAll({
        include: [
          { model: Course, as: 'Course' },
          { model: Teacher, as: 'Teacher' },
          { model: Student, as: 'Students' },
        ],
      });
      const courses = await Course.findAll({
        include: [
          { model: Subject, as: 'Subjects' },
        ],
      });
      const teachers = await Teacher.findAll();
      const subjects = await Subject.findAll({
        include: [
          { model: Course, as: 'Course' },
        ],
      });
      return res.render('admin_dashboard', { 
        classes, 
        courses, 
        teachers, 
        subjects,
        error: 'Email address already in use!' 
      });
    }

    // Create Teacher
    await Teacher.create({
      name: teacherName,
      email: teacherEmail,
      phone: teacherPhone || null,
      department: teacherDepartment || null,
      password:teacherPassword,
    });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create a New Class
router.post('/create-class', async (req, res) => {
  const { name, courseId, teacherId } = req.body;
  console.log('Creating class:', { name, courseId, teacherId });

  try {
    // Validate Course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(400).send('Invalid Course Selected');
    }

    // Validate Teacher
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(400).send('Invalid Teacher Selected');
    }

    // Create Class
    await Class.create({ name, courseId, teacherId });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).send('Internal Server Error');
  }
});

//add student
router.post('/add-student', async (req, res) => {
  const { studentName, rollNo, classId } = req.body;
  console.log('Adding student:', { studentName, rollNo, classId });

  try {
    // Validate Class
    const selectedClass = await Class.findByPk(classId, {
      include: [{ model: Course, as: 'Course', include: [{ model: Subject, as: 'Subjects' }] }]
    });

    if (!selectedClass) {
      return res.status(400).send('Invalid Class Selected');
    }

    // Check for existing roll number within the course
    const existingStudent = await Student.findOne({ 
      where: { 
        rollNo: rollNo,
        courseId: selectedClass.courseId
      } 
    });
    if (existingStudent) {
      const classes = await Class.findAll({
        include: [
          { model: Course, as: 'Course' },
          { model: Teacher, as: 'Teacher' },
          { model: Student, as: 'Students' },
        ],
      });
      const courses = await Course.findAll({
        include: [
          { model: Subject, as: 'Subjects' },
        ],
      });
      const teachers = await Teacher.findAll();
      const subjects = await Subject.findAll({
        include: [
          { model: Course, as: 'Course' },
        ],
      });
      return res.render('admin_dashboard', { 
        classes, 
        courses, 
        teachers, 
        subjects,
        error: 'Roll number already exists in this course!' 
      });
    }

    // Create Student
    const newStudent = await Student.create({ name: studentName, rollNo, courseId: selectedClass.courseId, classId: selectedClass.id });

    // Insert records into the StudentSubjectMarks table for each subject of the class/course
    const subjects = selectedClass.Course.Subjects;
    if (subjects && subjects.length > 0) {
      const studentSubjectMarksData = subjects.map(subject => ({
        studentId: newStudent.id,
        subjectId: subject.id,
        marksInternal: 0, // Set initial marks (could be set to null or a default value)
        marksExternal: 0,
        marksPractical: 0
      }));

      await StudentSubjectMark.bulkCreate(studentSubjectMarksData); // Bulk insert the records
    }

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create a New Course with Subjects (Without Marks)
router.post('/create-course', async (req, res) => {
  const { courseName, subjectName, internalMarks, externalMarks, practicalMarks } = req.body;
  console.log('Creating course with subjects:', { courseName, subjectName, internalMarks, externalMarks, practicalMarks });

  // Basic validation
  if (!courseName || !subjectName) {
    return res.status(400).send('Course name and at least one subject name are required');
  }

  try {
    // Start a transaction
    const result = await Course.sequelize.transaction(async (t) => {
      // Create the course
      const course = await Course.create({ name: courseName }, { transaction: t });

      // Iterate through subjects and create them
      for (let i = 0; i < subjectName.length; i++) {
        await Subject.create({
          name: subjectName[i],
          internalMarks: internalMarks && internalMarks[i] !== '' ? internalMarks[i] : null,
          externalMarks: externalMarks && externalMarks[i] !== '' ? externalMarks[i] : null,
          practicalMarks: practicalMarks && practicalMarks[i] !== '' ? practicalMarks[i] : null,
          courseId: course.id,
        }, { transaction: t });
      }

      return course;
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).send('Internal Server Error');
  }
});




// routes/admin.js

router.get('/verify-associations', async (req, res) => {
  try {
    const associations = Course.associations;
    console.log('Course Associations:', associations);
    
    const subjectAssociations = Subject.associations;
    console.log('Subject Associations:', subjectAssociations);

    const classes = await Class.findAll({
      include: [
        {
          model: Course,
          include: [Subject]  // Include subjects when fetching courses
        },
        {
          model: Student  // Include students as well
        }
      ]
    });
    console.log(classes.Course.Subject);
    
    res.send('Check the console for associations.');
  } catch (error) {
    console.error('Error verifying associations:', error);
    res.status(500).send('Internal Server Error');
  }
});

// routes/admin.js

router.get('/test-association', async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { name: 'Mathematics' },
      include: [{ model: Subject, as: 'Subjects' }],
    });

    console.log('Course with Subjects:', course);
    res.send('Check the console for course details.');
  } catch (error) {
    console.error('Error testing association:', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
