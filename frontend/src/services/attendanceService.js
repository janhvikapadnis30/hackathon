import { MOCK_ATTENDANCE } from '../data/mockData';

let attendanceRecords = [...MOCK_ATTENDANCE];
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAttendanceByStudent(studentId) {
  await delay();
  const numId = Number(studentId);
  const records = attendanceRecords.filter((a) => a.student_id === numId);
  const total = records.length || 10;
  const present = records.filter((r) => r.status === 'present').length || 8;
  return {
    success: true,
    data: {
      summary: {
        total_classes: total,
        attended_classes: present,
        overall_percentage: Math.round((present / total) * 100 * 10) / 10,
      },
      records: records.length > 0 ? records : MOCK_ATTENDANCE.slice(0, 5),
    },
  };
}

export async function getAttendanceByCourse(courseId) {
  await delay();
  return {
    success: true,
    data: attendanceRecords,
  };
}

export async function createAttendance(data) {
  await delay();
  const newRecord = {
    id: Date.now(),
    ...data,
  };
  attendanceRecords.unshift(newRecord);
  return { success: true, message: 'Attendance marked successfully', data: newRecord };
}

export async function updateAttendance(id, data) {
  await delay();
  const idx = attendanceRecords.findIndex((a) => a.id === Number(id));
  if (idx !== -1) {
    attendanceRecords[idx] = { ...attendanceRecords[idx], ...data };
    return { success: true, message: 'Attendance updated successfully', data: attendanceRecords[idx] };
  }
  return { success: false, message: 'Record not found' };
}
