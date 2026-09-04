const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles, verifyStudentOwnership } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// View student results (Admin, Faculty, or Student accessing own results)
router.get('/student/:studentId', verifyStudentOwnership('studentId'), resultController.getResultsByStudent);

// View exam results (Admin, Faculty)
router.get('/exam/:examId', authorizeRoles('admin', 'faculty'), resultController.getResultsByExam);

// Enter result (Admin, Faculty)
router.post('/', authorizeRoles('admin', 'faculty'), resultController.createResult);

// Update result (Admin, Faculty)
router.put('/:id', authorizeRoles('admin', 'faculty'), resultController.updateResult);

// Delete result (Admin only)
router.delete('/:id', authorizeRoles('admin'), resultController.deleteResult);

module.exports = router;
