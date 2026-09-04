const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'student_erp_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    // Verify that user exists in database
    const userResult = await query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.',
      });
    }

    const user = userResult.rows[0];

    // If role is student, resolve and attach student profile ID
    if (user.role === 'student') {
      const studentResult = await query('SELECT id, roll_number, department_id, semester FROM students WHERE user_id = $1', [user.id]);
      if (studentResult.rows.length > 0) {
        user.student_id = studentResult.rows[0].id;
        user.roll_number = studentResult.rows[0].roll_number;
        user.department_id = studentResult.rows[0].department_id;
        user.semester = studentResult.rows[0].semester;
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
}

module.exports = {
  authenticateToken,
};
