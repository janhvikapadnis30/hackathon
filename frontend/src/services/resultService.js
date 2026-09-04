import { MOCK_RESULTS } from '../data/mockData';

let results = [...MOCK_RESULTS];
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

function calculateGrade(pct) {
  if (pct >= 90) return { grade: 'A+', points: 10.0 };
  if (pct >= 80) return { grade: 'A', points: 9.0 };
  if (pct >= 75) return { grade: 'B+', points: 8.0 };
  if (pct >= 70) return { grade: 'B', points: 7.0 };
  if (pct >= 60) return { grade: 'C', points: 6.0 };
  if (pct >= 50) return { grade: 'D', points: 5.0 };
  return { grade: 'F', points: 0.0 };
}

export async function getResultsByStudent(studentId) {
  await delay();
  const numId = Number(studentId);
  const records = results.filter((r) => r.student_id === numId);
  return {
    success: true,
    data: records.length > 0 ? records : results.filter((r) => r.student_id === 1),
  };
}

export async function getResultsByExam(examId) {
  await delay();
  const numId = Number(examId);
  const records = results.filter((r) => r.exam_id === numId);
  return {
    success: true,
    data: records.length > 0 ? records : results,
  };
}

export async function createResult(data) {
  await delay();
  const pct = Math.round(((data.marks_obtained || 0) / (data.max_marks || 100)) * 100);
  const { grade, points } = calculateGrade(pct);

  const newResult = {
    id: Date.now(),
    ...data,
    percentage: pct,
    grade,
    grade_points: points,
  };
  results.unshift(newResult);
  return { success: true, message: 'Result recorded successfully', data: newResult };
}

export async function updateResult(id, data) {
  await delay();
  const idx = results.findIndex((r) => r.id === Number(id));
  if (idx !== -1) {
    const pct = Math.round(((data.marks_obtained || results[idx].marks_obtained) / (data.max_marks || results[idx].max_marks)) * 100);
    const { grade, points } = calculateGrade(pct);
    results[idx] = { ...results[idx], ...data, percentage: pct, grade, grade_points: points };
    return { success: true, message: 'Result updated successfully', data: results[idx] };
  }
  return { success: false, message: 'Result not found' };
}

export async function deleteResult(id) {
  await delay();
  results = results.filter((r) => r.id !== Number(id));
  return { success: true, message: 'Result deleted successfully' };
}
