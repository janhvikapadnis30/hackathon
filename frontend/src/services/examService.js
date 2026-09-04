import api from './api';

export async function getAllExams(params = {}) {
  const response = await api.get('/exams', { params });
  return response.data;
}

export async function getExam(id) {
  const response = await api.get(`/exams/${id}`);
  return response.data;
}

export async function createExam(data) {
  const response = await api.post('/exams', data);
  return response.data;
}

export async function updateExam(id, data) {
  const response = await api.put(`/exams/${id}`, data);
  return response.data;
}

export async function deleteExam(id) {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
}
