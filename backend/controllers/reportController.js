const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { query } = require('../config/db');

// ============================================================================
// PDF REPORT CONTROLLERS (PDFKit)
// ============================================================================

/**
 * Helper to draw a horizontal rule on PDF
 */
function drawHr(doc, y) {
  doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

/**
 * GET /api/reports/student/:studentId/pdf
 * Generate comprehensive PDF report card for a student
 */
async function generateStudentPDF(req, res, next) {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID.' });
    }

    // Fetch student info
    const studentRes = await query(
      `SELECT s.*, u.name, u.email, d.name AS department_name, d.code AS department_code
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const student = studentRes.rows[0];

    // Fetch attendance
    const attendanceRes = await query(
      `SELECT a.*, c.course_code, c.course_name
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = $1
       ORDER BY c.course_code ASC`,
      [studentId]
    );

    // Fetch fees
    const feesRes = await query(
      `SELECT * FROM fees WHERE student_id = $1 ORDER BY semester ASC`,
      [studentId]
    );

    // Fetch results
    const resultsRes = await query(
      `SELECT r.*, e.name AS exam_name, c.course_code, c.course_name
       FROM results r
       JOIN exams e ON r.exam_id = e.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.student_id = $1
       ORDER BY e.exam_date DESC, c.course_code ASC`,
      [studentId]
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="student_${student.roll_number}_report.pdf"`);

    doc.pipe(res);

    // Header
    doc.fillColor('#1f2937').fontSize(18).text('COLLEGE ERP SYSTEM', { align: 'center', bold: true });
    doc.fontSize(12).fillColor('#4b5563').text('Official Student Academic & Institutional Record', { align: 'center' });
    doc.fontSize(9).text(`Generated On: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);
    drawHr(doc, doc.y);
    doc.moveDown(1);

    // Student Information Table / Block
    doc.fontSize(14).fillColor('#111827').text('Student Profile', { underline: true });
    doc.moveDown(0.5);

    const startY = doc.y;
    doc.fontSize(10).fillColor('#374151');
    doc.text(`Full Name: ${student.name}`, 50, startY);
    doc.text(`Roll Number: ${student.roll_number}`, 320, startY);
    doc.text(`Email: ${student.email}`, 50, startY + 16);
    doc.text(`Department: ${student.department_name} (${student.department_code})`, 320, startY + 16);
    doc.text(`Current Semester: ${student.semester}`, 50, startY + 32);
    doc.text(`Admission Year: ${student.admission_year}`, 320, startY + 32);
    doc.text(`Phone: ${student.phone || 'N/A'}`, 50, startY + 48);
    doc.text(`Address: ${student.address || 'N/A'}`, 320, startY + 48);

    doc.y = startY + 70;
    drawHr(doc, doc.y);
    doc.moveDown(1);

    // Attendance Section
    doc.fontSize(14).fillColor('#111827').text('Attendance Record', { underline: true });
    doc.moveDown(0.5);

    if (attendanceRes.rows.length === 0) {
      doc.fontSize(10).fillColor('#6b7280').text('No attendance records found.');
    } else {
      let curY = doc.y;
      doc.fontSize(9).fillColor('#1f2937');
      doc.text('Course Code', 50, curY, { bold: true });
      doc.text('Course Name', 140, curY, { bold: true });
      doc.text('Attended', 360, curY, { bold: true });
      doc.text('Total', 430, curY, { bold: true });
      doc.text('Percentage', 490, curY, { bold: true });
      doc.moveDown(0.5);
      drawHr(doc, doc.y);

      attendanceRes.rows.forEach((att) => {
        doc.moveDown(0.3);
        curY = doc.y;
        doc.fontSize(9).fillColor('#374151');
        doc.text(att.course_code, 50, curY);
        doc.text(att.course_name.length > 30 ? att.course_name.substring(0, 27) + '...' : att.course_name, 140, curY);
        doc.text(`${att.classes_attended}`, 360, curY);
        doc.text(`${att.total_classes}`, 430, curY);
        doc.text(`${att.percentage}%`, 490, curY);
      });
    }

    doc.moveDown(1.5);
    drawHr(doc, doc.y);
    doc.moveDown(1);

    // Examination Results Section
    doc.fontSize(14).fillColor('#111827').text('Examination Results', { underline: true });
    doc.moveDown(0.5);

    if (resultsRes.rows.length === 0) {
      doc.fontSize(10).fillColor('#6b7280').text('No examination results recorded.');
    } else {
      let curY = doc.y;
      doc.fontSize(9).fillColor('#1f2937');
      doc.text('Exam', 50, curY);
      doc.text('Course Code', 180, curY);
      doc.text('Course Name', 270, curY);
      doc.text('Marks', 450, curY);
      doc.text('Grade', 500, curY);
      doc.moveDown(0.5);
      drawHr(doc, doc.y);

      resultsRes.rows.forEach((resRow) => {
        doc.moveDown(0.3);
        curY = doc.y;
        doc.fontSize(9).fillColor('#374151');
        doc.text(resRow.exam_name, 50, curY);
        doc.text(resRow.course_code, 180, curY);
        doc.text(resRow.course_name.length > 25 ? resRow.course_name.substring(0, 22) + '...' : resRow.course_name, 270, curY);
        doc.text(`${resRow.marks}`, 450, curY);
        doc.text(resRow.grade, 500, curY);
      });
    }

    doc.moveDown(1.5);
    drawHr(doc, doc.y);
    doc.moveDown(1);

    // Fee Status Section
    doc.fontSize(14).fillColor('#111827').text('Fee Status & Dues', { underline: true });
    doc.moveDown(0.5);

    if (feesRes.rows.length === 0) {
      doc.fontSize(10).fillColor('#6b7280').text('No fee records found.');
    } else {
      let curY = doc.y;
      doc.fontSize(9).fillColor('#1f2937');
      doc.text('Semester', 50, curY);
      doc.text('Total Fee', 150, curY);
      doc.text('Amount Paid', 250, curY);
      doc.text('Amount Due', 360, curY);
      doc.text('Status', 470, curY);
      doc.moveDown(0.5);
      drawHr(doc, doc.y);

      feesRes.rows.forEach((fee) => {
        doc.moveDown(0.3);
        curY = doc.y;
        doc.fontSize(9).fillColor('#374151');
        doc.text(`Semester ${fee.semester}`, 50, curY);
        doc.text(`Rs. ${fee.total_fee}`, 150, curY);
        doc.text(`Rs. ${fee.amount_paid}`, 250, curY);
        doc.text(`Rs. ${fee.amount_due}`, 360, curY);
        doc.text(fee.status, 470, curY);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#9ca3af').text('This document is electronically generated by the College ERP System. No physical signature is required.', { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/attendance/pdf
 * Generate attendance register report
 */
async function generateAttendancePDF(req, res, next) {
  try {
    const { course_id } = req.query;

    let queryText = `
      SELECT 
        a.id,
        s.roll_number,
        u.name AS student_name,
        d.code AS department_code,
        c.course_code,
        c.course_name,
        a.total_classes,
        a.classes_attended,
        a.percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (course_id) {
      params.push(parseInt(course_id, 10));
      queryText += ` AND a.course_id = $${params.length}`;
    }
    queryText += ' ORDER BY c.course_code ASC, s.roll_number ASC';

    const result = await query(queryText, params);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.pdf"');
    doc.pipe(res);

    doc.fontSize(16).fillColor('#1f2937').text('COLLEGE ERP - ATTENDANCE REGISTER', { align: 'center' });
    doc.fontSize(10).fillColor('#4b5563').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);
    drawHr(doc, doc.y);

    let curY = doc.y + 10;
    doc.fontSize(9).fillColor('#111827');
    doc.text('Roll No.', 40, curY);
    doc.text('Student Name', 110, curY);
    doc.text('Course', 240, curY);
    doc.text('Classes', 380, curY);
    doc.text('Attended', 440, curY);
    doc.text('Percent', 510, curY);
    doc.moveDown(0.5);
    drawHr(doc, doc.y);

    result.rows.forEach((row) => {
      doc.moveDown(0.3);
      if (doc.y > 750) doc.addPage();
      curY = doc.y;
      doc.fontSize(8).fillColor('#374151');
      doc.text(row.roll_number, 40, curY);
      doc.text(row.student_name.length > 20 ? row.student_name.substring(0, 18) + '...' : row.student_name, 110, curY);
      doc.text(`${row.course_code}`, 240, curY);
      doc.text(`${row.total_classes}`, 380, curY);
      doc.text(`${row.classes_attended}`, 440, curY);
      doc.text(`${row.percentage}%`, 510, curY);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/fees/pdf
 * Generate institutional fee collection and pending dues PDF
 */
async function generateFeesPDF(req, res, next) {
  try {
    const result = await query(
      `SELECT 
        f.id,
        s.roll_number,
        u.name AS student_name,
        d.code AS department_code,
        f.semester,
        f.total_fee,
        f.amount_paid,
        f.amount_due,
        f.status,
        f.due_date
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      ORDER BY f.status ASC, s.roll_number ASC`
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="fee_audit_report.pdf"');
    doc.pipe(res);

    doc.fontSize(16).fillColor('#1f2937').text('COLLEGE ERP - FEE AUDIT & COLLECTION REPORT', { align: 'center' });
    doc.fontSize(10).fillColor('#4b5563').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

    const totalFee = result.rows.reduce((sum, r) => sum + parseFloat(r.total_fee), 0);
    const totalPaid = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_paid), 0);
    const totalDue = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_due), 0);

    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#1e40af').text(`Total Billed: Rs. ${totalFee.toFixed(2)} | Total Collected: Rs. ${totalPaid.toFixed(2)} | Total Outstanding: Rs. ${totalDue.toFixed(2)}`, { align: 'center' });
    doc.moveDown(0.5);
    drawHr(doc, doc.y);

    let curY = doc.y + 10;
    doc.fontSize(9).fillColor('#111827');
    doc.text('Roll No.', 40, curY);
    doc.text('Student Name', 110, curY);
    doc.text('Sem', 240, curY);
    doc.text('Total', 280, curY);
    doc.text('Paid', 350, curY);
    doc.text('Due', 420, curY);
    doc.text('Status', 490, curY);
    doc.moveDown(0.5);
    drawHr(doc, doc.y);

    result.rows.forEach((row) => {
      doc.moveDown(0.3);
      if (doc.y > 750) doc.addPage();
      curY = doc.y;
      doc.fontSize(8).fillColor('#374151');
      doc.text(row.roll_number, 40, curY);
      doc.text(row.student_name.length > 20 ? row.student_name.substring(0, 18) + '...' : row.student_name, 110, curY);
      doc.text(`${row.semester}`, 240, curY);
      doc.text(`${row.total_fee}`, 280, curY);
      doc.text(`${row.amount_paid}`, 350, curY);
      doc.text(`${row.amount_due}`, 420, curY);
      doc.text(row.status, 490, curY);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/results/pdf
 * Generate exam results grade sheet PDF
 */
async function generateResultsPDF(req, res, next) {
  try {
    const { exam_id } = req.query;

    let queryText = `
      SELECT 
        r.id,
        s.roll_number,
        u.name AS student_name,
        d.code AS department_code,
        e.name AS exam_name,
        c.course_code,
        c.course_name,
        r.marks,
        r.grade
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      JOIN exams e ON r.exam_id = e.id
      JOIN courses c ON r.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (exam_id) {
      params.push(parseInt(exam_id, 10));
      queryText += ` AND r.exam_id = $${params.length}`;
    }
    queryText += ' ORDER BY e.name ASC, s.roll_number ASC, c.course_code ASC';

    const result = await query(queryText, params);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="examination_results_sheet.pdf"');
    doc.pipe(res);

    doc.fontSize(16).fillColor('#1f2937').text('COLLEGE ERP - EXAMINATION RESULTS SHEET', { align: 'center' });
    doc.fontSize(10).fillColor('#4b5563').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);
    drawHr(doc, doc.y);

    let curY = doc.y + 10;
    doc.fontSize(9).fillColor('#111827');
    doc.text('Roll No.', 40, curY);
    doc.text('Student Name', 110, curY);
    doc.text('Exam', 230, curY);
    doc.text('Course', 340, curY);
    doc.text('Marks', 460, curY);
    doc.text('Grade', 510, curY);
    doc.moveDown(0.5);
    drawHr(doc, doc.y);

    result.rows.forEach((row) => {
      doc.moveDown(0.3);
      if (doc.y > 750) doc.addPage();
      curY = doc.y;
      doc.fontSize(8).fillColor('#374151');
      doc.text(row.roll_number, 40, curY);
      doc.text(row.student_name.length > 18 ? row.student_name.substring(0, 16) + '...' : row.student_name, 110, curY);
      doc.text(row.exam_name.length > 16 ? row.exam_name.substring(0, 14) + '...' : row.exam_name, 230, curY);
      doc.text(`${row.course_code}`, 340, curY);
      doc.text(`${row.marks}`, 460, curY);
      doc.text(row.grade, 510, curY);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// EXCEL REPORT CONTROLLERS (ExcelJS)
// ============================================================================

/**
 * Style header row helper
 */
function styleHeaderRow(worksheet) {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;
}

/**
 * GET /api/reports/students/excel
 * Export master students roster as Excel
 */
async function generateStudentsExcel(req, res, next) {
  try {
    const result = await query(
      `SELECT 
        s.id,
        s.roll_number,
        u.name,
        u.email,
        d.name AS department_name,
        d.code AS department_code,
        s.semester,
        s.phone,
        s.date_of_birth,
        s.address,
        s.admission_year,
        s.created_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      ORDER BY s.roll_number ASC`
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'College ERP System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Roll Number', key: 'roll_number', width: 16 },
      { header: 'Full Name', key: 'name', width: 25 },
      { header: 'Email Address', key: 'email', width: 28 },
      { header: 'Department', key: 'department_name', width: 25 },
      { header: 'Dept Code', key: 'department_code', width: 12 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Date of Birth', key: 'date_of_birth', width: 14 },
      { header: 'Admission Year', key: 'admission_year', width: 16 },
      { header: 'Address', key: 'address', width: 35 },
    ];

    styleHeaderRow(worksheet);

    result.rows.forEach((r) => {
      worksheet.addRow({
        ...r,
        date_of_birth: r.date_of_birth ? new Date(r.date_of_birth).toISOString().split('T')[0] : 'N/A',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students_roster.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/attendance/excel
 * Export attendance register as Excel
 */
async function generateAttendanceExcel(req, res, next) {
  try {
    const result = await query(
      `SELECT 
        a.id,
        s.roll_number,
        u.name AS student_name,
        d.code AS department_code,
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
      JOIN departments d ON s.department_id = d.id
      JOIN courses c ON a.course_id = c.id
      ORDER BY c.course_code ASC, s.roll_number ASC`
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Roll Number', key: 'roll_number', width: 16 },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Department', key: 'department_code', width: 12 },
      { header: 'Course Code', key: 'course_code', width: 14 },
      { header: 'Course Name', key: 'course_name', width: 28 },
      { header: 'Total Classes', key: 'total_classes', width: 14 },
      { header: 'Classes Attended', key: 'classes_attended', width: 16 },
      { header: 'Percentage (%)', key: 'percentage', width: 16 },
      { header: 'Last Updated', key: 'updated_at', width: 20 },
    ];

    styleHeaderRow(worksheet);

    result.rows.forEach((r) => {
      worksheet.addRow({
        ...r,
        updated_at: r.updated_at ? new Date(r.updated_at).toLocaleString() : 'N/A',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/fees/excel
 * Export fee audit ledger as Excel
 */
async function generateFeesExcel(req, res, next) {
  try {
    const result = await query(
      `SELECT 
        f.id,
        s.roll_number,
        u.name AS student_name,
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
      ORDER BY f.status ASC, s.roll_number ASC`
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fee Ledgers');

    worksheet.columns = [
      { header: 'Fee ID', key: 'id', width: 10 },
      { header: 'Roll Number', key: 'roll_number', width: 16 },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Department', key: 'department_code', width: 14 },
      { header: 'Semester', key: 'semester', width: 12 },
      { header: 'Total Fee (Rs)', key: 'total_fee', width: 16 },
      { header: 'Amount Paid (Rs)', key: 'amount_paid', width: 16 },
      { header: 'Amount Due (Rs)', key: 'amount_due', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Due Date', key: 'due_date', width: 14 },
    ];

    styleHeaderRow(worksheet);

    let sumTotal = 0;
    let sumPaid = 0;
    let sumDue = 0;

    result.rows.forEach((r) => {
      const total = parseFloat(r.total_fee);
      const paid = parseFloat(r.amount_paid);
      const due = parseFloat(r.amount_due);

      sumTotal += total;
      sumPaid += paid;
      sumDue += due;

      worksheet.addRow({
        ...r,
        total_fee: total,
        amount_paid: paid,
        amount_due: due,
        due_date: r.due_date ? new Date(r.due_date).toISOString().split('T')[0] : 'N/A',
      });
    });

    // Summary row
    const totalRow = worksheet.addRow({
      roll_number: 'TOTALS',
      total_fee: sumTotal,
      amount_paid: sumPaid,
      amount_due: sumDue,
    });
    totalRow.font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="fee_audit_report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/results/excel
 * Export examination results as Excel
 */
async function generateResultsExcel(req, res, next) {
  try {
    const result = await query(
      `SELECT 
        r.id,
        s.roll_number,
        u.name AS student_name,
        d.code AS department_code,
        e.name AS exam_name,
        c.course_code,
        c.course_name,
        r.marks,
        r.grade,
        r.created_at
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      JOIN exams e ON r.exam_id = e.id
      JOIN courses c ON r.course_id = c.id
      ORDER BY e.name ASC, s.roll_number ASC, c.course_code ASC`
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Results');

    worksheet.columns = [
      { header: 'Result ID', key: 'id', width: 10 },
      { header: 'Roll Number', key: 'roll_number', width: 16 },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Department', key: 'department_code', width: 14 },
      { header: 'Exam Name', key: 'exam_name', width: 22 },
      { header: 'Course Code', key: 'course_code', width: 14 },
      { header: 'Course Name', key: 'course_name', width: 28 },
      { header: 'Marks', key: 'marks', width: 12 },
      { header: 'Grade', key: 'grade', width: 10 },
    ];

    styleHeaderRow(worksheet);

    result.rows.forEach((r) => {
      worksheet.addRow({
        ...r,
        marks: parseFloat(r.marks),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="examination_results.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateStudentPDF,
  generateAttendancePDF,
  generateFeesPDF,
  generateResultsPDF,
  generateStudentsExcel,
  generateAttendanceExcel,
  generateFeesExcel,
  generateResultsExcel,
};
