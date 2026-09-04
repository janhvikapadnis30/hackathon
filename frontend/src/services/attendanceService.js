import { MOCK_ATTENDANCE_ENTRIES, MOCK_COURSES, MOCK_STUDENTS } from '../data/mockData';

let attendanceRecords = [...MOCK_ATTENDANCE_ENTRIES];
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAttendanceByStudent(studentId) {
  await delay();
  const numId = Number(studentId);
  const records = attendanceRecords.filter((a) => a.student_id === numId);

  const fallbackRecords = records.length > 0 ? records : [
    {
      id: 1,
      student_id: numId,
      course_id: 5,
      course_code: 'CS501',
      course_name: 'Web Technologies',
      total_classes: 40,
      classes_attended: 35,
      percentage: 87.5,
    },
    {
      id: 2,
      student_id: numId,
      course_id: 6,
      course_code: 'CS502',
      course_name: 'Machine Learning',
      total_classes: 38,
      classes_attended: 33,
      percentage: 86.8,
    },
  ];

  const total = fallbackRecords.reduce((acc, r) => acc + (Number(r.total_classes) || 0), 0);
  const present = fallbackRecords.reduce((acc, r) => acc + (Number(r.classes_attended) || 0), 0);
  const pct = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

  return {
    success: true,
    summary: {
      total_classes: total,
      classes_attended: present,
      overall_percentage: pct,
    },
    data: fallbackRecords,
  };
}

export async function getAttendanceByCourse(courseId) {
  await delay();
  const cId = Number(courseId);
  const course = MOCK_COURSES.find((c) => c.id === cId) || MOCK_COURSES[0];
  const list = attendanceRecords.filter((a) => a.course_id === cId);

  return {
    success: true,
    course,
    count: list.length,
    data: list,
  };
}

export async function createAttendance(data) {
  await delay();
  const student = MOCK_STUDENTS.find((s) => s.id === Number(data.student_id));
  const course = MOCK_COURSES.find((c) => c.id === Number(data.course_id));

  const total = Number(data.total_classes) || 0;
  const attended = Number(data.classes_attended) || 0;
  const pct = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;

  // Check if record already exists for this student & course
  const existingIdx = attendanceRecords.findIndex(
    (a) => a.student_id === Number(data.student_id) && a.course_id === Number(data.course_id)
  );

  if (existingIdx !== -1) {
    attendanceRecords[existingIdx] = {
      ...attendanceRecords[existingIdx],
      total_classes: total,
      classes_attended: attended,
      percentage: pct,
    };
    return {
      success: true,
      message: 'Attendance updated successfully',
      data: attendanceRecords[existingIdx],
    };
  }

  const newRecord = {
    id: Date.now(),
    student_id: Number(data.student_id),
    roll_number: student ? student.roll_number : 'CS' + data.student_id,
    student_name: student ? student.name : 'Student ' + data.student_id,
    course_id: Number(data.course_id),
    course_code: course ? course.course_code : 'CRS',
    course_name: course ? course.course_name : 'Course',
    total_classes: total,
    classes_attended: attended,
    percentage: pct,
  };

  attendanceRecords.unshift(newRecord);
  return { success: true, message: 'Attendance recorded successfully', data: newRecord };
}

export async function updateAttendance(id, data) {
  await delay();
  const idx = attendanceRecords.findIndex((a) => a.id === Number(id));
  if (idx !== -1) {
    const total = Number(data.total_classes !== undefined ? data.total_classes : attendanceRecords[idx].total_classes);
    const attended = Number(data.classes_attended !== undefined ? data.classes_attended : attendanceRecords[idx].classes_attended);
    const pct = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;

    attendanceRecords[idx] = {
      ...attendanceRecords[idx],
      total_classes: total,
      classes_attended: attended,
      percentage: pct,
    };
    return {
      success: true,
      message: 'Attendance updated successfully',
      data: attendanceRecords[idx],
    };
  }
  return { success: false, message: 'Record not found' };
}
