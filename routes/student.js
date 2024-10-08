const express = require('express');
const router = express.Router();
const { Student, StudentSubjectMark, Subject } = require('../models'); // Import your models


router.get('/login', (req, res) => {
    res.render('student/student_login.ejs', { message: null });
  });
// Handle student login
router.post('/login', async (req, res) => {
  const { rollNo } = req.body;
  try {
    const student = await Student.findOne({ where: { rollNo } });
    if (!student) {
      return res.status(400).send('Invalid roll number');
    }
    req.session.studentId = student.id;  // Store student ID in session
    res.redirect('/student/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
router.get('/dashboard', async (req, res) => {
    const studentId = req.session.studentId;
  
    if (!studentId) {
      return res.redirect('/student/login'); // Redirect if not logged in
    }
  
    try {
      const student = await Student.findByPk(studentId, {
        include: [{ model: StudentSubjectMark, as: 'StudentSubjectMarks', include: [{model:Subject,as:'Subject'}] }]
      });
  
      const marks = student.StudentSubjectMarks.map((mark) => {
        const internal = mark.marksInternal || 0;
        const external = mark.marksExternal || 0;
        const practical = mark.marksPractical || 0;
  
        const failed = internal < 10 || external < 30 || practical < 20;  // Check if failed
  
        return {
          Subject: mark.Subject,
          marksInternal: internal,
          marksExternal: external,
          marksPractical: practical,
          failed,
          total: failed ? null : internal + external + practical,
          percentage: failed ? null : ((internal + external + practical) / 150) * 100,  // Assuming full marks is 150
        };
      });
  
       // Calculate total marks of all subjects and percentage
    const totalMarks = marks.reduce((sum, mark) => {
        return mark.total !== null ? sum + mark.total : sum;
      }, 0);
  
      const totalMaxMarks = marks.reduce((sum, mark) => {
        return !mark.failed ? sum + 150 : sum;
      }, 0);
  
      const percentage = totalMaxMarks ? (totalMarks / totalMaxMarks) * 100 : null;
  
      const failed = marks.some((mark) => mark.failed);  // If any subject has failed
  
      res.render('student/student_dashboard', { student, marks, failed,totalMarks ,percentage});
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  

module.exports = router;
