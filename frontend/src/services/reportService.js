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
  const content = `APEX INSTITUTE OF TECHNOLOGY - STUDENT DOSSIER\nRoll Number: ${rollNumber}\nGenerated: ${new Date().toLocaleDateString()}\nStatus: Verified`;
  triggerBrowserDownload(content, `student_${rollNumber}_report.txt`, 'text/plain');
}

export async function downloadAttendancePDF(courseId = null) {
  const content = `APEX INSTITUTE - ATTENDANCE AUDIT\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified Attendance Register`;
  triggerBrowserDownload(content, 'attendance_report.txt', 'text/plain');
}

export async function downloadFeesPDF() {
  const content = `APEX INSTITUTE - FEE RECONCILIATION STATEMENT\nDate: ${new Date().toLocaleDateString()}\nStatus: Audited`;
  triggerBrowserDownload(content, 'fee_audit_report.txt', 'text/plain');
}

export async function downloadResultsPDF(examId = null) {
  const content = `APEX INSTITUTE - EXAMINATION TABULATION REGISTER\nDate: ${new Date().toLocaleDateString()}`;
  triggerBrowserDownload(content, 'examination_results_sheet.txt', 'text/plain');
}

export async function downloadStudentsExcel() {
  const csv = 'Roll Number,Name,Department,Semester,Attendance %,CGPA\nCS2021001,Aarav Singh,Computer Science,5,87.5%,8.4\nCS2021002,Ananya Patel,Computer Science,5,72.3%,7.9\nCS2021003,Arjun Reddy,Computer Science,5,91.2%,9.1';
  triggerBrowserDownload(csv, 'students_roster.csv', 'text/csv');
}

export async function downloadAttendanceExcel() {
  const csv = 'Course,Total Classes,Average Attendance %\nWeb Technologies,40,84.5%\nMachine Learning,38,82.0%';
  triggerBrowserDownload(csv, 'attendance_report.csv', 'text/csv');
}

export async function downloadFeesExcel() {
  const csv = 'Roll Number,Student,Fee Type,Total,Paid,Due,Status\nCS2021001,Aarav Singh,Tuition Fee,75000,75000,0,Paid\nCS2021002,Ananya Patel,Tuition Fee,75000,40000,35000,Partial';
  triggerBrowserDownload(csv, 'fee_audit_report.csv', 'text/csv');
}

export async function downloadResultsExcel() {
  const csv = 'Roll Number,Student,Exam,Subject,Marks,Grade\nCS2021001,Aarav Singh,Mid-Sem,Web Tech,85,A\nCS2021002,Ananya Patel,Mid-Sem,Web Tech,72,B';
  triggerBrowserDownload(csv, 'examination_results.csv', 'text/csv');
}
