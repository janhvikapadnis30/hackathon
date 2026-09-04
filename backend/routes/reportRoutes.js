const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles, verifyStudentOwnership } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// --- PDF Endpoints ---

// Student PDF Report (Admin, Faculty, or Student accessing own report)
router.get('/student/:studentId/pdf', verifyStudentOwnership('studentId'), reportController.generateStudentPDF);

// Attendance PDF Report (Admin, Faculty)
router.get('/attendance/pdf', authorizeRoles('admin', 'faculty'), reportController.generateAttendancePDF);

// Fees PDF Report (Admin)
router.get('/fees/pdf', authorizeRoles('admin'), reportController.generateFeesPDF);

// Results PDF Report (Admin, Faculty)
router.get('/results/pdf', authorizeRoles('admin', 'faculty'), reportController.generateResultsPDF);

// --- Excel Endpoints ---

// Students Master Excel (Admin, Faculty)
router.get('/students/excel', authorizeRoles('admin', 'faculty'), reportController.generateStudentsExcel);

// Attendance Excel (Admin, Faculty)
router.get('/attendance/excel', authorizeRoles('admin', 'faculty'), reportController.generateAttendanceExcel);

// Fees Audit Excel (Admin)
router.get('/fees/excel', authorizeRoles('admin'), reportController.generateFeesExcel);

// Results Excel (Admin, Faculty)
router.get('/results/excel', authorizeRoles('admin', 'faculty'), reportController.generateResultsExcel);

module.exports = router;
