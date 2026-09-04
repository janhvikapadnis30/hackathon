import { MOCK_EXAMS } from '../data/mockData';

let exams = [...MOCK_EXAMS];
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllExams(params = {}) {
  await delay();
  let filtered = [...exams];
  if (params.semester) {
    filtered = filtered.filter((e) => e.semester === Number(params.semester));
  }
  return { success: true, count: filtered.length, data: filtered };
}

export async function getExam(id) {
  await delay();
  const exam = exams.find((e) => e.id === Number(id));
  if (!exam) return { success: false, message: 'Exam not found' };
  return { success: true, data: exam };
}

export async function createExam(data) {
  await delay();
  const newExam = { id: Date.now(), ...data };
  exams.unshift(newExam);
  return { success: true, message: 'Exam created successfully', data: newExam };
}

export async function updateExam(id, data) {
  await delay();
  const idx = exams.findIndex((e) => e.id === Number(id));
  if (idx !== -1) {
    exams[idx] = { ...exams[idx], ...data };
    return { success: true, message: 'Exam updated successfully', data: exams[idx] };
  }
  return { success: false, message: 'Exam not found' };
}

export async function deleteExam(id) {
  await delay();
  exams = exams.filter((e) => e.id !== Number(id));
  return { success: true, message: 'Exam deleted successfully' };
}
