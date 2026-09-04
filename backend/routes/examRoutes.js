const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// View exams (Admin, Faculty, Student)
router.get('/', examController.getAllExams);

// View single exam (Admin, Faculty, Student)
router.get('/:id', examController.getExamById);

// Create exam (Admin, Faculty)
router.post('/', authorizeRoles('admin', 'faculty'), examController.createExam);

// Update exam (Admin, Faculty)
router.put('/:id', authorizeRoles('admin', 'faculty'), examController.updateExam);

// Delete exam (Admin only)
router.delete('/:id', authorizeRoles('admin'), examController.deleteExam);

module.exports = router;
