const { query } = require('../config/db');

/**
 * GET /api/attendance/student/:studentId
 * Retrieve attendance records for a specific student across all courses
 */
async function getAttendanceByStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided.',
      });
    }

    // Verify student exists
    const studentCheck = await query('SELECT id, roll_number FROM students WHERE id = $1', [studentId]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found.`,
      });
    }

    const result = await query(
      `SELECT 
        a.id,
        a.student_id,
        s.roll_number,
        u.name AS student_name,
        a.course_id,
        c.course_code,
        c.course_name,
        c.semester,
        a.total_classes,
        a.classes_attended,
        a.percentage,
        a.updated_at
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = $1
      ORDER BY c.course_code ASC`,
      [studentId]
    );

    const totalClasses = result.rows.reduce((acc, row) => acc + row.total_classes, 0);
    const classesAttended = result.rows.reduce((acc, row) => acc + row.classes_attended, 0);
    const overallPercentage = totalClasses > 0 ? parseFloat(((classesAttended / totalClasses) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        total_courses: result.rows.length,
        total_classes: totalClasses,
        classes_attended: classesAttended,
        overall_percentage: overallPercentage,
      },
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/attendance/course/:courseId
 * Retrieve attendance records for all students in a specific course
 */
async function getAttendanceByCourse(req, res, next) {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID provided.',
      });
    }

    // Verify course exists
    const courseCheck = await query('SELECT id, course_code, course_name FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${courseId} not found.`,
      });
    }

    const result = await query(
      `SELECT 
        a.id,
        a.student_id,
        s.roll_number,
        u.name AS student_name,
        u.email AS student_email,
        a.course_id,
        c.course_code,
        c.course_name,
        a.total_classes,
        a.classes_attended,
        a.percentage,
        a.updated_at
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON a.course_id = c.id
      WHERE a.course_id = $1
      ORDER BY s.roll_number ASC`,
      [courseId]
    );

    return res.status(200).json({
      success: true,
      course: courseCheck.rows[0],
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/attendance
 * Create or upsert an attendance record with server-calculated percentage
 */
async function createAttendance(req, res, next) {
  try {
    const { student_id, course_id, total_classes, classes_attended } = req.body;

    if (student_id === undefined || course_id === undefined || total_classes === undefined || classes_attended === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: student_id, course_id, total_classes, classes_attended.',
      });
    }

    const sId = parseInt(student_id, 10);
    const cId = parseInt(course_id, 10);
    const total = parseInt(total_classes, 10);
    const attended = parseInt(classes_attended, 10);

    if (isNaN(sId) || isNaN(cId) || isNaN(total) || isNaN(attended)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid numerical values for attendance record.',
      });
    }

    if (total < 0 || attended < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total classes and classes attended must be non-negative integers.',
      });
    }

    if (attended > total) {
      return res.status(400).json({
        success: false,
        message: 'Classes attended cannot be greater than total classes.',
      });
    }

    // Verify student exists
    const studentCheck = await query('SELECT id FROM students WHERE id = $1', [sId]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${sId} does not exist.`,
      });
    }

    // Verify course exists
    const courseCheck = await query('SELECT id FROM courses WHERE id = $1', [cId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${cId} does not exist.`,
      });
    }

    // Calculate percentage on backend
    const percentage = total === 0 ? 100.00 : parseFloat(((attended / total) * 100).toFixed(2));

    const result = await query(
      `INSERT INTO attendance (student_id, course_id, total_classes, classes_attended, percentage, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET
         total_classes = EXCLUDED.total_classes,
         classes_attended = EXCLUDED.classes_attended,
         percentage = EXCLUDED.percentage,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [sId, cId, total, attended, percentage]
    );

    return res.status(201).json({
      success: true,
      message: 'Attendance record saved successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/attendance/:id
 * Update an existing attendance record
 */
async function updateAttendance(req, res, next) {
  try {
    const attendanceId = parseInt(req.params.id, 10);
    if (isNaN(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID provided.',
      });
    }

    const existingRecordResult = await query('SELECT * FROM attendance WHERE id = $1', [attendanceId]);
    if (existingRecordResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Attendance record with ID ${attendanceId} not found.`,
      });
    }

    const currentRecord = existingRecordResult.rows[0];

    const total = req.body.total_classes !== undefined ? parseInt(req.body.total_classes, 10) : currentRecord.total_classes;
    const attended = req.body.classes_attended !== undefined ? parseInt(req.body.classes_attended, 10) : currentRecord.classes_attended;

    if (isNaN(total) || isNaN(attended) || total < 0 || attended < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total classes and classes attended must be non-negative integers.',
      });
    }

    if (attended > total) {
      return res.status(400).json({
        success: false,
        message: 'Classes attended cannot exceed total classes.',
      });
    }

    const percentage = total === 0 ? 100.00 : parseFloat(((attended / total) * 100).toFixed(2));

    const result = await query(
      `UPDATE attendance
       SET total_classes = $1,
           classes_attended = $2,
           percentage = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [total, attended, percentage, attendanceId]
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAttendanceByStudent,
  getAttendanceByCourse,
  createAttendance,
  updateAttendance,
};
