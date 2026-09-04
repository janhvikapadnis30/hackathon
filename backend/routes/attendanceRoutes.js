const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles, verifyStudentOwnership } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// View attendance by student (Admin, Faculty, or Student accessing own records)
router.get('/student/:studentId', verifyStudentOwnership('studentId'), attendanceController.getAttendanceByStudent);

// View attendance by course (Admin, Faculty)
router.get('/course/:courseId', authorizeRoles('admin', 'faculty'), attendanceController.getAttendanceByCourse);

// Record attendance (Admin, Faculty)
router.post('/', authorizeRoles('admin', 'faculty'), attendanceController.createAttendance);

// Update attendance (Admin, Faculty)
router.put('/:id', authorizeRoles('admin', 'faculty'), attendanceController.updateAttendance);

module.exports = router;
