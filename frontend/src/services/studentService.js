import {
  MOCK_STUDENTS,
  MOCK_DEPARTMENTS,
  MOCK_COURSES,
  MOCK_ATTENDANCE,
  MOCK_ATTENDANCE_SUMMARY,
  MOCK_FEES,
  MOCK_EXAMS,
  MOCK_RESULTS,
  MOCK_USERS,
} from '../data/mockData';

// In-memory data stores initialized with mock data
let students = [...MOCK_STUDENTS];
let departments = [...MOCK_DEPARTMENTS];
let courses = [...MOCK_COURSES];
let attendanceRecords = [...MOCK_ATTENDANCE];
let feeRecords = [...MOCK_FEES];
let exams = [...MOCK_EXAMS];
let results = [...MOCK_RESULTS];

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// ================= STUDENTS =================
export async function getStudents(params = {}) {
  await delay();
  let filtered = [...students];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q))
    );
  }
  if (params.department) {
    filtered = filtered.filter((s) => s.department === params.department || s.department_code === params.department);
  }
  return { success: true, count: filtered.length, data: filtered };
}

export async function getStudent(id) {
  await delay();
  const student = students.find((s) => s.id === Number(id));
  if (!student) return { success: false, message: 'Student not found' };
  return { success: true, data: student };
}

export async function getStudentProfile(id) {
  await delay();
  const numId = Number(id);
  const student = students.find((s) => s.id === numId) || students[0];
  const studentAttendance = attendanceRecords.filter((a) => a.student_id === numId);
  const studentFees = feeRecords.filter((f) => f.student_id === numId);
  const studentResults = results.filter((r) => r.student_id === numId);

  return {
    success: true,
    data: {
      personal_info: {
        id: student.id,
        name: student.name,
        roll_number: student.roll_number,
        email: student.email,
        phone: student.phone,
        department_name: student.department,
        semester: student.semester,
        admission_year: student.admission_year || 2023,
      },
      attendance: {
        summary: {
          total_classes: 40,
          attended_classes: Math.round((student.attendance_pct || 85) * 0.4),
          overall_percentage: student.attendance_pct || 85,
        },
        records: studentAttendance.length > 0 ? studentAttendance : MOCK_ATTENDANCE.slice(0, 5),
      },
      fees: {
        summary: {
          total_fees: studentFees.reduce((acc, f) => acc + (f.amount || 0), 0) || 77000,
          total_paid: studentFees.reduce((acc, f) => acc + (f.amount_paid || 0), 0) || 77000,
          total_due: studentFees.reduce((acc, f) => acc + (f.amount_due || 0), 0) || 0,
        },
        records: studentFees.length > 0 ? studentFees : MOCK_FEES.filter((f) => f.student_id === 1),
      },
      results: studentResults.length > 0 ? studentResults : MOCK_RESULTS.filter((r) => r.student_id === 1),
    },
  };
}

export async function createStudent(data) {
  await delay();
  const newStudent = {
    id: Date.now(),
    ...data,
    attendance_pct: 100,
    fee_status: 'pending',
    cgpa: 0,
  };
  students.unshift(newStudent);
  return { success: true, message: 'Student created successfully', data: newStudent };
}

export async function updateStudent(id, data) {
  await delay();
  const idx = students.findIndex((s) => s.id === Number(id));
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...data };
    return { success: true, message: 'Student updated successfully', data: students[idx] };
  }
  return { success: false, message: 'Student not found' };
}

export async function deleteStudent(id) {
  await delay();
  students = students.filter((s) => s.id !== Number(id));
  return { success: true, message: 'Student deleted successfully' };
}
