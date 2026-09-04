const { query } = require('../config/db');

/**
 * GET /api/exams
 * Retrieve all exams with optional semester filter
 */
async function getAllExams(req, res, next) {
  try {
    const { semester } = req.query;
    let queryText = 'SELECT * FROM exams WHERE 1=1';
    const params = [];

    if (semester) {
      params.push(parseInt(semester, 10));
      queryText += ` AND semester = $${params.length}`;
    }

    queryText += ' ORDER BY exam_date DESC, id DESC';

    const result = await query(queryText, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/exams/:id
 * Retrieve a single exam by ID
 */
async function getExamById(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID provided.',
      });
    }

    const result = await query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Exam with ID ${examId} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/exams
 * Schedule/create an exam (Admin, Faculty)
 */
async function createExam(req, res, next) {
  try {
    const { name, semester, exam_date } = req.body;

    if (!name || !semester || !exam_date) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: name, semester, exam_date.',
      });
    }

    const sem = parseInt(semester, 10);
    if (isNaN(sem) || sem < 1 || sem > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be an integer between 1 and 8.',
      });
    }

    const result = await query(
      `INSERT INTO exams (name, semester, exam_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), sem, exam_date]
    );

    return res.status(201).json({
      success: true,
      message: 'Exam created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/exams/:id
 * Update an existing exam (Admin, Faculty)
 */
async function updateExam(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID provided.',
      });
    }

    const { name, semester, exam_date } = req.body;

    const existingExam = await query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (existingExam.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Exam with ID ${examId} not found.`,
      });
    }

    const current = existingExam.rows[0];
    const sem = semester !== undefined ? parseInt(semester, 10) : current.semester;

    if (isNaN(sem) || sem < 1 || sem > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be an integer between 1 and 8.',
      });
    }

    const result = await query(
      `UPDATE exams
       SET name = COALESCE($1, name),
           semester = $2,
           exam_date = COALESCE($3, exam_date)
       WHERE id = $4
       RETURNING *`,
      [name ? name.trim() : null, sem, exam_date || null, examId]
    );

    return res.status(200).json({
      success: true,
      message: 'Exam updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/exams/:id
 * Delete an exam (Admin only)
 */
async function deleteExam(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID provided.',
      });
    }

    const result = await query('DELETE FROM exams WHERE id = $1 RETURNING id', [examId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Exam with ID ${examId} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Exam with ID ${examId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
