const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
