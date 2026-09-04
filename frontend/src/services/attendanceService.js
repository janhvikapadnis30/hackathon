import api from './api';

export async function getAttendanceByStudent(studentId) {
  const response = await api.get(`/attendance/student/${studentId}`);
  return response.data;
}

export async function getAttendanceByCourse(courseId) {
  const response = await api.get(`/attendance/course/${courseId}`);
  return response.data;
}

export async function createAttendance(data) {
  const response = await api.post('/attendance', data);
  return response.data;
}

export async function updateAttendance(id, data) {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data;
}
