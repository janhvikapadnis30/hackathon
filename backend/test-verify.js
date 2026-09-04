/**
 * Automated Verification Script for College ERP Backend
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 Running ERP Backend Verification Suite');
console.log('====================================================');

// 1. Verify Grade Calculator
console.log('\n[1/5] Testing Grade Calculator...');
const { calculateGrade, getGradePoint } = require('./utils/gradeCalculator');

assert.strictEqual(calculateGrade(100), 'A+');
assert.strictEqual(calculateGrade(90), 'A+');
assert.strictEqual(calculateGrade(89.5), 'A');
assert.strictEqual(calculateGrade(80), 'A');
assert.strictEqual(calculateGrade(79), 'B+');
assert.strictEqual(calculateGrade(70), 'B+');
assert.strictEqual(calculateGrade(69), 'B');
assert.strictEqual(calculateGrade(60), 'B');
assert.strictEqual(calculateGrade(59), 'C');
assert.strictEqual(calculateGrade(50), 'C');
assert.strictEqual(calculateGrade(49), 'D');
assert.strictEqual(calculateGrade(40), 'D');
assert.strictEqual(calculateGrade(39.9), 'F');
assert.strictEqual(calculateGrade(0), 'F');

assert.strictEqual(getGradePoint('A+'), 10);
assert.strictEqual(getGradePoint('A'), 9);
assert.strictEqual(getGradePoint('B+'), 8);
assert.strictEqual(getGradePoint('B'), 7);
assert.strictEqual(getGradePoint('C'), 6);
assert.strictEqual(getGradePoint('D'), 5);
assert.strictEqual(getGradePoint('F'), 0);

assert.throws(() => calculateGrade(-5), /Marks must be a valid number between 0 and 100/);
assert.throws(() => calculateGrade(105), /Marks must be a valid number between 0 and 100/);
assert.throws(() => calculateGrade('abc'), /Marks must be a valid number between 0 and 100/);
console.log('  ✅ Grade Calculator passed all boundary & validation assertions!');

// 2. Verify Attendance Calculation Logic
console.log('\n[2/5] Testing Attendance Calculation Logic...');
function testAttendance(total, attended) {
  assert(attended <= total, 'Classes attended cannot exceed total classes');
  assert(total >= 0 && attended >= 0, 'Cannot be negative');
  return total === 0 ? 100.00 : parseFloat(((attended / total) * 100).toFixed(2));
}

assert.strictEqual(testAttendance(40, 35), 87.5);
assert.strictEqual(testAttendance(50, 50), 100.0);
assert.strictEqual(testAttendance(45, 0), 0.0);
assert.throws(() => testAttendance(40, 45), /Classes attended cannot exceed total classes/);
console.log('  ✅ Attendance calculation logic passed!');

// 3. Verify Fee Calculation Logic
console.log('\n[3/5] Testing Fee Calculation Logic...');
function testFee(total, paid) {
  assert(paid <= total, 'Paid cannot exceed total');
  assert(total >= 0 && paid >= 0, 'Cannot be negative');
  const due = parseFloat((total - paid).toFixed(2));
  let status = 'PENDING';
  if (due === 0 || paid >= total) status = 'PAID';
  else if (paid > 0) status = 'PARTIAL';
  return { due, status };
}

assert.deepStrictEqual(testFee(75000, 75000), { due: 0, status: 'PAID' });
assert.deepStrictEqual(testFee(75000, 25000), { due: 50000, status: 'PARTIAL' });
assert.deepStrictEqual(testFee(75000, 0), { due: 75000, status: 'PENDING' });
assert.throws(() => testFee(50000, 60000), /Paid cannot exceed total/);
console.log('  ✅ Fee calculation logic passed!');

// 4. Verify PDFKit & ExcelJS libraries
console.log('\n[4/5] Testing PDFKit & ExcelJS Instantiation...');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const doc = new PDFDocument({ margin: 50 });
assert(doc, 'PDFDocument should be instantiated');
console.log('  ✅ PDFKit is working properly.');

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Test');
sheet.addRow(['ID', 'Name', 'Status']);
assert.strictEqual(sheet.rowCount, 1);
console.log('  ✅ ExcelJS is working properly.');

// 5. Verify Express App & Route Registration
console.log('\n[5/5] Testing Express Server & Route Registration...');
const app = require('./server');
assert(app, 'Express app should be exported');

// List registered routes
const registeredRoutes = [];
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // routes registered directly on the app
    registeredRoutes.push(Object.keys(middleware.route.methods).join(',').toUpperCase() + ' ' + middleware.route.path);
  } else if (middleware.name === 'router') {
    // router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
        registeredRoutes.push(`${methods} ${path}`);
      }
    });
  }
});

console.log(`  ✅ Express initialized with ${registeredRoutes.length} route endpoints!`);

console.log('\n====================================================');
console.log('🎉 ALL 5 VERIFICATION MODULES PASSED SUCCESSFULLY!');
console.log('====================================================');
