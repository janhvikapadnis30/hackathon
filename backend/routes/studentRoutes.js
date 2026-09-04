const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles, verifyStudentOwnership } = require('../middleware/roleMiddleware');

// All student routes require authentication
router.use(authenticateToken);

// List all students (Admin, Faculty)
router.get('/', authorizeRoles('admin', 'faculty'), studentController.getAllStudents);

// Create student (Admin only)
router.post('/', authorizeRoles('admin'), studentController.createStudent);

// Get integrated profile (Admin, Faculty, or Student accessing own profile)
router.get('/:id/profile', verifyStudentOwnership('id'), studentController.getStudentProfile);

// Get single student by ID (Admin, Faculty, or Student accessing own profile)
router.get('/:id', verifyStudentOwnership('id'), studentController.getStudentById);

// Update student (Admin only)
router.put('/:id', authorizeRoles('admin'), studentController.updateStudent);

// Delete student (Admin only)
router.delete('/:id', authorizeRoles('admin'), studentController.deleteStudent);

module.exports = router;
