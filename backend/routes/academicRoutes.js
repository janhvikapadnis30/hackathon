const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

/**
 * GET /api/academic/departments or /api/departments
 */
router.get('/departments', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/academic/courses or /api/courses
 * Optional queries: department_id, semester
 */
router.get('/courses', async (req, res, next) => {
  try {
    const { department_id, semester } = req.query;
    let queryText = `
      SELECT c.*, d.name AS department_name, d.code AS department_code 
      FROM courses c 
      JOIN departments d ON c.department_id = d.id 
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      params.push(parseInt(department_id, 10));
      queryText += ` AND c.department_id = $${params.length}`;
    }

    if (semester) {
      params.push(parseInt(semester, 10));
      queryText += ` AND c.semester = $${params.length}`;
    }

    queryText += ' ORDER BY c.semester ASC, c.course_code ASC';

    const result = await query(queryText, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
