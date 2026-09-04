import api from './api';

function triggerBrowserDownload(blobData, defaultFileName, contentType) {
  const blob = new Blob([blobData], { type: contentType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = defaultFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function downloadStudentPDF(studentId, rollNumber = 'report') {
  const response = await api.get(`/reports/student/${studentId}/pdf`, { responseType: 'blob' });
  triggerBrowserDownload(response.data, `student_${rollNumber}_report.pdf`, 'application/pdf');
}

export async function downloadAttendancePDF(courseId = null) {
  const params = courseId ? { course_id: courseId } : {};
  const response = await api.get('/reports/attendance/pdf', { params, responseType: 'blob' });
  triggerBrowserDownload(response.data, 'attendance_report.pdf', 'application/pdf');
}

export async function downloadFeesPDF() {
  const response = await api.get('/reports/fees/pdf', { responseType: 'blob' });
  triggerBrowserDownload(response.data, 'fee_audit_report.pdf', 'application/pdf');
}

export async function downloadResultsPDF(examId = null) {
  const params = examId ? { exam_id: examId } : {};
  const response = await api.get('/reports/results/pdf', { params, responseType: 'blob' });
  triggerBrowserDownload(response.data, 'examination_results_sheet.pdf', 'application/pdf');
}

export async function downloadStudentsExcel() {
  const response = await api.get('/reports/students/excel', { responseType: 'blob' });
  triggerBrowserDownload(response.data, 'students_roster.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

export async function downloadAttendanceExcel() {
  const response = await api.get('/reports/attendance/excel', { responseType: 'blob' });
  triggerBrowserDownload(response.data, 'attendance_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

export async function downloadFeesExcel() {
  const response = await api.get('/reports/fees/excel', { responseType: 'blob' });
  triggerBrowserDownload(response.data, 'fee_audit_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

export async function downloadResultsExcel() {
  const response = await api.get('/reports/results/excel', { responseType: 'blob' });
  triggerBrowserDownload(response.data, 'examination_results.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
