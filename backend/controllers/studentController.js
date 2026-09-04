const bcrypt = require('bcryptjs');
const { query, getClient } = require('../config/db');

/**
 * GET /api/students
 * Retrieve all students with optional filtering (Admin, Faculty)
 */
async function getAllStudents(req, res, next) {
  try {
    const { department_id, semester, search } = req.query;

    let queryText = `
      SELECT 
        s.id,
        s.user_id,
        s.roll_number,
        s.semester,
        s.phone,
        s.date_of_birth,
        s.address,
        s.admission_year,
        s.created_at,
        u.name,
        u.email,
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      params.push(parseInt(department_id, 10));
      queryText += ` AND s.department_id = $${params.length}`;
    }

    if (semester) {
      params.push(parseInt(semester, 10));
      queryText += ` AND s.semester = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (
        LOWER(u.name) LIKE $${params.length} OR 
        LOWER(u.email) LIKE $${params.length} OR 
        LOWER(s.roll_number) LIKE $${params.length}
      )`;
    }

    queryText += ' ORDER BY s.roll_number ASC';

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
 * GET /api/students/:id
 * Retrieve a single student by ID
 */
async function getStudentById(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided.',
      });
    }

    const queryText = `
      SELECT 
        s.id,
        s.user_id,
        s.roll_number,
        s.semester,
        s.phone,
        s.date_of_birth,
        s.address,
        s.admission_year,
        s.created_at,
        u.name,
        u.email,
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      WHERE s.id = $1
    `;
    const result = await query(queryText, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found.`,
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
 * POST /api/students
 * Create a new student (User + Student record) (Admin only)
 */
async function createStudent(req, res, next) {
  const client = await getClient();
  try {
    const {
      name,
      email,
      password,
      roll_number,
      department_id,
      semester,
      phone,
      date_of_birth,
      address,
      admission_year,
    } = req.body;

    // Validation
    if (!name || !email || !roll_number || !department_id || !semester || !admission_year) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: name, email, roll_number, department_id, semester, admission_year.',
      });
    }

    const semNumber = parseInt(semester, 10);
    if (isNaN(semNumber) || semNumber < 1 || semNumber > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be an integer between 1 and 8.',
      });
    }

    await client.query('BEGIN');

    // 1. Check duplicate email
    const existingEmail = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (existingEmail.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // 2. Check duplicate roll number
    const existingRoll = await client.query('SELECT id FROM students WHERE LOWER(roll_number) = $1', [roll_number.trim().toLowerCase()]);
    if (existingRoll.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists.',
      });
    }

    // 3. Verify department exists
    const deptCheck = await client.query('SELECT id FROM departments WHERE id = $1', [department_id]);
    if (deptCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Specified department does not exist.',
      });
    }

    // 4. Hash password
    const rawPassword = password || 'Student@123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 5. Create user
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );
    const newUser = userResult.rows[0];

    // 6. Create student
    const studentResult = await client.query(
      `INSERT INTO students (user_id, roll_number, department_id, semester, phone, date_of_birth, address, admission_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        newUser.id,
        roll_number.trim().toUpperCase(),
        department_id,
        semNumber,
        phone || null,
        date_of_birth || null,
        address || null,
        parseInt(admission_year, 10),
      ]
    );
    const newStudent = studentResult.rows[0];

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: {
        ...newStudent,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

/**
 * PUT /api/students/:id
 * Update an existing student record (Admin only)
 */
async function updateStudent(req, res, next) {
  const client = await getClient();
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided.',
      });
    }

    const {
      name,
      email,
      roll_number,
      department_id,
      semester,
      phone,
      date_of_birth,
      address,
      admission_year,
    } = req.body;

    await client.query('BEGIN');

    const existingStudentResult = await client.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (existingStudentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found.`,
      });
    }
    const currentStudent = existingStudentResult.rows[0];

    // Update user info if name or email provided
    if (name || email) {
      const userUpdates = [];
      const userParams = [];

      if (name) {
        userParams.push(name.trim());
        userUpdates.push(`name = $${userParams.length}`);
      }

      if (email) {
        const checkEmail = await client.query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [email.trim().toLowerCase(), currentStudent.user_id]);
        if (checkEmail.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Another user is already using this email.',
          });
        }
        userParams.push(email.trim().toLowerCase());
        userUpdates.push(`email = $${userParams.length}`);
      }

      userParams.push(currentStudent.user_id);
      await client.query(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${userParams.length}`,
        userParams
      );
    }

    // Update student fields
    if (department_id) {
      const deptCheck = await client.query('SELECT id FROM departments WHERE id = $1', [department_id]);
      if (deptCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Specified department does not exist.',
        });
      }
    }

    if (roll_number) {
      const checkRoll = await client.query('SELECT id FROM students WHERE LOWER(roll_number) = $1 AND id != $2', [roll_number.trim().toLowerCase(), studentId]);
      if (checkRoll.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Another student already has this roll number.',
        });
      }
    }

    const updatedStudentResult = await client.query(
      `UPDATE students
       SET roll_number = COALESCE($1, roll_number),
           department_id = COALESCE($2, department_id),
           semester = COALESCE($3, semester),
           phone = COALESCE($4, phone),
           date_of_birth = COALESCE($5, date_of_birth),
           address = COALESCE($6, address),
           admission_year = COALESCE($7, admission_year)
       WHERE id = $8
       RETURNING *`,
      [
        roll_number ? roll_number.trim().toUpperCase() : null,
        department_id ? parseInt(department_id, 10) : null,
        semester ? parseInt(semester, 10) : null,
        phone !== undefined ? phone : null,
        date_of_birth || null,
        address !== undefined ? address : null,
        admission_year ? parseInt(admission_year, 10) : null,
        studentId,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updatedStudentResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

/**
 * DELETE /api/students/:id
 * Delete a student record and their associated user account (Admin only)
 */
async function deleteStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided.',
      });
    }

    const studentResult = await query('SELECT user_id FROM students WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found.`,
      });
    }

    const userId = studentResult.rows[0].user_id;

    // Deleting the user will cascade delete the student record and related entries
    await query('DELETE FROM users WHERE id = $1', [userId]);

    return res.status(200).json({
      success: true,
      message: `Student with ID ${studentId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/students/:id/profile
 * Retrieve integrated student profile (Profile, Attendance summary, Fees status, Results)
 */
async function getStudentProfile(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided.',
      });
    }

    // 1. Basic Student Info
    const studentResult = await query(
      `SELECT 
        s.id,
        s.user_id,
        s.roll_number,
        s.semester,
        s.phone,
        s.date_of_birth,
        s.address,
        s.admission_year,
        s.created_at,
        u.name,
        u.email,
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      WHERE s.id = $1`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found.`,
      });
    }

    const student = studentResult.rows[0];

    // 2. Attendance Overview
    const attendanceResult = await query(
      `SELECT 
        a.id,
        a.course_id,
        c.course_code,
        c.course_name,
        a.total_classes,
        a.classes_attended,
        a.percentage,
        a.updated_at
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = $1
      ORDER BY c.course_code ASC`,
      [studentId]
    );

    const totalClassesSum = attendanceResult.rows.reduce((sum, r) => sum + r.total_classes, 0);
    const attendedClassesSum = attendanceResult.rows.reduce((sum, r) => sum + r.classes_attended, 0);
    const overallAttendancePercentage = totalClassesSum > 0 ? parseFloat(((attendedClassesSum / totalClassesSum) * 100).toFixed(2)) : 0;

    // 3. Fees Overview
    const feesResult = await query(
      `SELECT 
        id,
        semester,
        total_fee,
        amount_paid,
        amount_due,
        status,
        due_date,
        updated_at
      FROM fees
      WHERE student_id = $1
      ORDER BY semester ASC`,
      [studentId]
    );

    const totalFees = feesResult.rows.reduce((sum, f) => sum + parseFloat(f.total_fee), 0);
    const totalPaid = feesResult.rows.reduce((sum, f) => sum + parseFloat(f.amount_paid), 0);
    const totalDue = feesResult.rows.reduce((sum, f) => sum + parseFloat(f.amount_due), 0);

    // 4. Examination Results Overview
    const resultsData = await query(
      `SELECT 
        r.id,
        r.exam_id,
        e.name AS exam_name,
        e.semester AS exam_semester,
        r.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        r.marks,
        r.grade,
        r.created_at
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN courses c ON r.course_id = c.id
      WHERE r.student_id = $1
      ORDER BY e.exam_date DESC, c.course_code ASC`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      data: {
        personal_info: student,
        attendance: {
          overall_percentage: overallAttendancePercentage,
          total_classes: totalClassesSum,
          attended_classes: attendedClassesSum,
          records: attendanceResult.rows,
        },
        fees: {
          total_fee: totalFees,
          total_paid: totalPaid,
          total_due: totalDue,
          records: feesResult.rows,
        },
        results: resultsData.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentProfile,
};
