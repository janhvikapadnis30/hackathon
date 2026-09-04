import api from './api';

export async function getResultsByStudent(studentId) {
  const response = await api.get(`/results/student/${studentId}`);
  return response.data;
}

export async function getResultsByExam(examId) {
  const response = await api.get(`/results/exam/${examId}`);
  return response.data;
}

export async function createResult(data) {
  const response = await api.post('/results', data);
  return response.data;
}

export async function updateResult(id, data) {
  const response = await api.put(`/results/${id}`, data);
  return response.data;
}

export async function deleteResult(id) {
  const response = await api.delete(`/results/${id}`);
  return response.data;
}
