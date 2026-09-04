const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * POST /api/auth/login
 * User authentication and JWT generation
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const userResult = await query('SELECT * FROM users WHERE LOWER(email) = $1', [trimmedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    let studentProfile = null;
    if (user.role === 'student') {
      const studentResult = await query(
        `SELECT s.id, s.roll_number, s.semester, s.department_id, d.name AS department_name, d.code AS department_code
         FROM students s
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE s.user_id = $1`,
        [user.id]
      );
      if (studentResult.rows.length > 0) {
        studentProfile = studentResult.rows[0];
      }
    }

    const secret = process.env.JWT_SECRET || 'student_erp_super_secret_jwt_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_id: studentProfile ? studentProfile.id : null,
        roll_number: studentProfile ? studentProfile.roll_number : null,
        department: studentProfile ? studentProfile.department_name : null,
        department_code: studentProfile ? studentProfile.department_code : null,
        semester: studentProfile ? studentProfile.semester : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Retrieve currently logged in user context
 */
async function getCurrentUser(req, res, next) {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  getCurrentUser,
};
