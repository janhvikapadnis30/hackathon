import {
  MOCK_STUDENTS,
  MOCK_DEPARTMENTS,
  MOCK_COURSES,
  MOCK_ATTENDANCE_ENTRIES,
  MOCK_FEES,
  MOCK_EXAMS,
  MOCK_RESULTS,
  MOCK_USERS,
} from '../data/mockData';

let students = [...MOCK_STUDENTS];
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getStudents(params = {}) {
  await delay();
  let filtered = [...students];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.roll_number.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }

  // Support department_id or department name/code
  if (params.department_id) {
    filtered = filtered.filter(
      (s) => s.department_id === Number(params.department_id)
    );
  } else if (params.department) {
    filtered = filtered.filter(
      (s) =>
        s.department === params.department ||
        s.department_code === params.department ||
        s.department_id === Number(params.department)
    );
  }

  if (params.semester) {
    filtered = filtered.filter((s) => Number(s.semester) === Number(params.semester));
  }

  return { success: true, count: filtered.length, data: filtered };
}

export async function getStudent(id) {
  await delay();
  const student = students.find((s) => s.id === Number(id)) || students[0];
  if (!student) return { success: false, message: 'Student not found' };
  return { success: true, data: student };
}

export async function getStudentProfile(id) {
  await delay();
  const numId = Number(id);
  const student = students.find((s) => s.id === numId) || students[0];

  const studentAttendance = MOCK_ATTENDANCE_ENTRIES.filter((a) => a.student_id === student.id);
  const totalClasses = studentAttendance.reduce((acc, a) => acc + a.total_classes, 0) || 40;
  const attendedClasses = studentAttendance.reduce((acc, a) => acc + a.classes_attended, 0) || 35;
  const overallPercentage = totalClasses > 0 ? parseFloat(((attendedClasses / totalClasses) * 100).toFixed(1)) : 85;

  const studentFees = MOCK_FEES.filter((f) => f.student_id === student.id);
  const studentResults = MOCK_RESULTS.filter((r) => r.student_id === student.id);

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
        department_code: student.department_code,
        semester: student.semester,
        admission_year: student.admission_year || 2021,
      },
      attendance: {
        summary: {
          total_classes: totalClasses,
          attended_classes: attendedClasses,
          overall_percentage: overallPercentage,
        },
        records: studentAttendance.length > 0 ? studentAttendance : [
          {
            id: 1,
            course_code: 'CS501',
            course_name: 'Web Technologies',
            total_classes: 40,
            classes_attended: 35,
            percentage: 87.5,
          },
        ],
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
  const dept = MOCK_DEPARTMENTS.find((d) => d.id === Number(data.department_id)) || MOCK_DEPARTMENTS[0];
  const newStudent = {
    id: Date.now(),
    name: data.name,
    email: data.email,
    roll_number: data.roll_number,
    department: dept.name,
    department_id: dept.id,
    department_code: dept.code,
    semester: Number(data.semester) || 1,
    phone: data.phone || '9876543299',
    admission_year: Number(data.admission_year) || 2024,
    attendance_pct: 100,
    fee_status: 'pending',
    cgpa: 0,
  };
  students.unshift(newStudent);
  return { success: true, message: 'Student registered successfully', data: newStudent };
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
