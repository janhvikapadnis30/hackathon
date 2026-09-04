const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles, verifyStudentOwnership } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// View fees for a student (Admin or Student accessing own records)
router.get('/student/:studentId', verifyStudentOwnership('studentId'), feeController.getFeesByStudent);

// View all fees across the institution (Admin only)
router.get('/', authorizeRoles('admin'), feeController.getAllFees);

// Create new fee invoice (Admin only)
router.post('/', authorizeRoles('admin'), feeController.createFee);

// Update fee invoice / record payment (Admin only)
router.put('/:id', authorizeRoles('admin'), feeController.updateFee);

module.exports = router;
