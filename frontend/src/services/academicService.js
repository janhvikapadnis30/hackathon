import api from './api';

export async function getDepartments() {
  const response = await api.get('/departments');
  return response.data;
}

export async function getCourses(params = {}) {
  const response = await api.get('/courses', { params });
  return response.data;
}
