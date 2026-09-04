const { query } = require('../config/db');

/**
 * Helper to compute amount_due and status
 */
function computeFeeStatus(totalFee, amountPaid) {
  const total = parseFloat(totalFee);
  const paid = parseFloat(amountPaid || 0);

  if (isNaN(total) || isNaN(paid)) {
    throw new Error('Fee values must be valid numbers.');
  }

  if (total < 0 || paid < 0) {
    throw new Error('Fee amounts cannot be negative.');
  }

  if (paid > total) {
    throw new Error('Amount paid cannot exceed the total fee.');
  }

  const due = parseFloat((total - paid).toFixed(2));
  let status = 'PENDING';
  if (due === 0 || paid >= total) {
    status = 'PAID';
  } else if (paid > 0) {
    status = 'PARTIAL';
  }

  return { total, paid, due, status };
}

/**
 * GET /api/fees/student/:studentId
 * Retrieve fee ledger and invoices for a student
 */
async function getFeesByStudent(req, res, next) {
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
      `SELECT s.id, s.roll_number, u.name, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
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
        id,
        student_id,
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

    const totalInvoiced = result.rows.reduce((sum, r) => sum + parseFloat(r.total_fee), 0);
    const totalPaid = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_paid), 0);
    const totalDue = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_due), 0);

    return res.status(200).json({
      success: true,
      student: studentCheck.rows[0],
      summary: {
        total_invoiced: totalInvoiced,
        total_paid: totalPaid,
        total_due: totalDue,
      },
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/fees
 * Retrieve all fee records across the institution with optional status/semester filters (Admin only)
 */
async function getAllFees(req, res, next) {
  try {
    const { status, semester, search } = req.query;

    let queryText = `
      SELECT 
        f.id,
        f.student_id,
        s.roll_number,
        u.name AS student_name,
        u.email AS student_email,
        d.code AS department_code,
        f.semester,
        f.total_fee,
        f.amount_paid,
        f.amount_due,
        f.status,
        f.due_date,
        f.updated_at
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status.trim().toUpperCase());
      queryText += ` AND f.status = $${params.length}`;
    }

    if (semester) {
      params.push(parseInt(semester, 10));
      queryText += ` AND f.semester = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (
        LOWER(u.name) LIKE $${params.length} OR 
        LOWER(s.roll_number) LIKE $${params.length}
      )`;
    }

    queryText += ' ORDER BY f.due_date ASC, f.id DESC';

    const result = await query(queryText, params);

    const totalCollected = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_paid), 0);
    const totalOutstanding = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_due), 0);

    return res.status(200).json({
      success: true,
      summary: {
        total_records: result.rows.length,
        total_collected: totalCollected,
        total_outstanding: totalOutstanding,
      },
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/fees
 * Create a new fee obligation for a student (Admin only)
 */
async function createFee(req, res, next) {
  try {
    const { student_id, semester, total_fee, amount_paid, due_date } = req.body;

    if (!student_id || !semester || total_fee === undefined || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: student_id, semester, total_fee, due_date.',
      });
    }

    const sId = parseInt(student_id, 10);
    const sem = parseInt(semester, 10);

    if (isNaN(sId) || isNaN(sem) || sem < 1 || sem > 8) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID or semester (must be 1-8).',
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

    // Compute due and status
    let feeCalculation;
    try {
      feeCalculation = computeFeeStatus(total_fee, amount_paid || 0);
    } catch (calcError) {
      return res.status(400).json({
        success: false,
        message: calcError.message,
      });
    }

    const result = await query(
      `INSERT INTO fees (student_id, semester, total_fee, amount_paid, amount_due, status, due_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        sId,
        sem,
        feeCalculation.total,
        feeCalculation.paid,
        feeCalculation.due,
        feeCalculation.status,
        due_date,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Fee record created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/fees/:id
 * Update an existing fee record (e.g. record payment) (Admin only)
 */
async function updateFee(req, res, next) {
  try {
    const feeId = parseInt(req.params.id, 10);
    if (isNaN(feeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee ID provided.',
      });
    }

    const existingFeeResult = await query('SELECT * FROM fees WHERE id = $1', [feeId]);
    if (existingFeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Fee record with ID ${feeId} not found.`,
      });
    }

    const currentFee = existingFeeResult.rows[0];

    const totalFee = req.body.total_fee !== undefined ? req.body.total_fee : currentFee.total_fee;
    const amountPaid = req.body.amount_paid !== undefined ? req.body.amount_paid : currentFee.amount_paid;
    const dueDate = req.body.due_date || currentFee.due_date;

    let feeCalculation;
    try {
      feeCalculation = computeFeeStatus(totalFee, amountPaid);
    } catch (calcError) {
      return res.status(400).json({
        success: false,
        message: calcError.message,
      });
    }

    const result = await query(
      `UPDATE fees
       SET total_fee = $1,
           amount_paid = $2,
           amount_due = $3,
           status = $4,
           due_date = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        feeCalculation.total,
        feeCalculation.paid,
        feeCalculation.due,
        feeCalculation.status,
        dueDate,
        feeId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Fee record updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFeesByStudent,
  getAllFees,
  createFee,
  updateFee,
};
