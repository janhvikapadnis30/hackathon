import api from './api';

export async function getFeesByStudent(studentId) {
  const response = await api.get(`/fees/student/${studentId}`);
  return response.data;
}

export async function getAllFees(params = {}) {
  const response = await api.get('/fees', { params });
  return response.data;
}

export async function createFee(data) {
  const response = await api.post('/fees', data);
  return response.data;
}

export async function updateFee(id, data) {
  const response = await api.put(`/fees/${id}`, data);
  return response.data;
}
