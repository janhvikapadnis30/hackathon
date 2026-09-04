const { query } = require('../config/db');
const { calculateGrade } = require('../utils/gradeCalculator');

/**
 * GET /api/results/student/:studentId
 * Retrieve academic results and grade sheet for a specific student
 */
async function getResultsByStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided.',
      });
    }

    // Verify student exists
    const studentCheck = await query(
      `SELECT s.id, s.roll_number, u.name, u.email, d.name AS department_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found.`,
      });
    }

    const result = await query(
      `SELECT 
        r.id,
        r.student_id,
        r.exam_id,
        e.name AS exam_name,
        e.semester AS exam_semester,
        e.exam_date,
        r.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        r.marks,
        r.grade,
        r.created_at,
        r.updated_at
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN courses c ON r.course_id = c.id
      WHERE r.student_id = $1
      ORDER BY e.exam_date DESC, c.course_code ASC`,
      [studentId]
    );

    const totalMarks = result.rows.reduce((sum, r) => sum + parseFloat(r.marks), 0);
    const averageMarks = result.rows.length > 0 ? parseFloat((totalMarks / result.rows.length).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      student: studentCheck.rows[0],
      summary: {
        total_subjects: result.rows.length,
        average_marks: averageMarks,
      },
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/results/exam/:examId
 * Retrieve results across all students for a specific exam (Admin, Faculty)
 */
async function getResultsByExam(req, res, next) {
  try {
    const examId = parseInt(req.params.examId, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID provided.',
      });
    }

    const examCheck = await query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (examCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Exam with ID ${examId} not found.`,
      });
    }

    const result = await query(
      `SELECT 
        r.id,
        r.student_id,
        s.roll_number,
        u.name AS student_name,
        d.code AS department_code,
        r.course_id,
        c.course_code,
        c.course_name,
        r.marks,
        r.grade,
        r.updated_at
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      JOIN courses c ON r.course_id = c.id
      WHERE r.exam_id = $1
      ORDER BY s.roll_number ASC, c.course_code ASC`,
      [examId]
    );

    return res.status(200).json({
      success: true,
      exam: examCheck.rows[0],
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/results
 * Record exam marks with server-calculated grade (Admin, Faculty)
 */
async function createResult(req, res, next) {
  try {
    const { student_id, course_id, exam_id, marks } = req.body;

    if (student_id === undefined || course_id === undefined || exam_id === undefined || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: student_id, course_id, exam_id, marks.',
      });
    }

    const sId = parseInt(student_id, 10);
    const cId = parseInt(course_id, 10);
    const eId = parseInt(exam_id, 10);
    const numericMarks = parseFloat(marks);

    if (isNaN(sId) || isNaN(cId) || isNaN(eId) || isNaN(numericMarks)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid numerical inputs for result.',
      });
    }

    if (numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be between 0 and 100.',
      });
    }

    // Verify foreign entities exist
    const studentCheck = await query('SELECT id FROM students WHERE id = $1', [sId]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Student with ID ${sId} not found.` });
    }

    const courseCheck = await query('SELECT id FROM courses WHERE id = $1', [cId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Course with ID ${cId} not found.` });
    }

    const examCheck = await query('SELECT id FROM exams WHERE id = $1', [eId]);
    if (examCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Exam with ID ${eId} not found.` });
    }

    // Calculate grade on backend
    const grade = calculateGrade(numericMarks);

    const result = await query(
      `INSERT INTO results (student_id, course_id, exam_id, marks, grade, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, course_id, exam_id)
       DO UPDATE SET
         marks = EXCLUDED.marks,
         grade = EXCLUDED.grade,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [sId, cId, eId, numericMarks, grade]
    );

    return res.status(201).json({
      success: true,
      message: 'Result recorded successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/results/:id
 * Update existing marks and recalculate grade (Admin, Faculty)
 */
async function updateResult(req, res, next) {
  try {
    const resultId = parseInt(req.params.id, 10);
    if (isNaN(resultId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result ID provided.',
      });
    }

    const { marks } = req.body;
    if (marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Marks field is required for update.',
      });
    }

    const numericMarks = parseFloat(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be a valid number between 0 and 100.',
      });
    }

    const existingResult = await query('SELECT * FROM results WHERE id = $1', [resultId]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Result record with ID ${resultId} not found.`,
      });
    }

    const grade = calculateGrade(numericMarks);

    const result = await query(
      `UPDATE results
       SET marks = $1,
           grade = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [numericMarks, grade, resultId]
    );

    return res.status(200).json({
      success: true,
      message: 'Result updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/results/:id
 * Remove a result record (Admin only)
 */
async function deleteResult(req, res, next) {
  try {
    const resultId = parseInt(req.params.id, 10);
    if (isNaN(resultId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result ID provided.',
      });
    }

    const result = await query('DELETE FROM results WHERE id = $1 RETURNING id', [resultId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Result with ID ${resultId} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Result with ID ${resultId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getResultsByStudent,
  getResultsByExam,
  createResult,
  updateResult,
  deleteResult,
};
