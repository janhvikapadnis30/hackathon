/**
 * Academic Grade Calculator
 * Maps marks (0 - 100) to letter grades and grade points.
 * 
 * 90–100 = A+
 * 80–89  = A
 * 70–79  = B+
 * 60–69  = B
 * 50–59  = C
 * 40–49  = D
 * Below 40 = F
 */

function calculateGrade(marks) {
  const numericMarks = Number(marks);

  if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
    throw new Error('Marks must be a valid number between 0 and 100.');
  }

  if (numericMarks >= 90) return 'A+';
  if (numericMarks >= 80) return 'A';
  if (numericMarks >= 70) return 'B+';
  if (numericMarks >= 60) return 'B';
  if (numericMarks >= 50) return 'C';
  if (numericMarks >= 40) return 'D';
  return 'F';
}

function getGradePoint(grade) {
  const gradePoints = {
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C': 6,
    'D': 5,
    'F': 0,
  };
  return gradePoints[grade] !== undefined ? gradePoints[grade] : 0;
}

module.exports = {
  calculateGrade,
  getGradePoint,
};
