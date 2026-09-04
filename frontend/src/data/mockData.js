// ─── Mock Data for ERP System (no backend/DB needed) ───────────────────────

export const MOCK_USERS = {
  admin: {
    id: 1,
    name: 'Dr. Priya Sharma',
    email: 'admin@erp.com',
    role: 'admin',
    department: 'Administration',
    avatar: 'PS',
  },
  faculty: {
    id: 2,
    name: 'Prof. Rajesh Kumar',
    email: 'faculty1@erp.com',
    role: 'faculty',
    department: 'Computer Science',
    avatar: 'RK',
  },
  student: {
    id: 3,
    student_id: 1,
    name: 'Aarav Singh',
    email: 'student1@erp.com',
    role: 'student',
    roll_number: 'CS2021001',
    department: 'Computer Science',
    department_id: 1,
    semester: 5,
    avatar: 'AS',
  },
};

export const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Computer Science', code: 'CS', hod: 'Dr. Anita Verma', students: 180 },
  { id: 2, name: 'Electronics Engineering', code: 'EC', hod: 'Dr. Suresh Nair', students: 150 },
  { id: 3, name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Ramesh Gupta', students: 140 },
  { id: 4, name: 'Civil Engineering', code: 'CE', hod: 'Dr. Pooja Mehta', students: 120 },
  { id: 5, name: 'Information Technology', code: 'IT', hod: 'Dr. Vikram Rao', students: 160 },
];

export const MOCK_COURSES = [
  { id: 1, name: 'Data Structures', course_name: 'Data Structures', code: 'CS301', course_code: 'CS301', department_id: 1, department_code: 'CS', semester: 3, credits: 4, faculty: 'Prof. Rajesh Kumar' },
  { id: 2, name: 'Database Management', course_name: 'Database Management', code: 'CS302', course_code: 'CS302', department_id: 1, department_code: 'CS', semester: 3, credits: 4, faculty: 'Prof. Meena Iyer' },
  { id: 3, name: 'Operating Systems', course_name: 'Operating Systems', code: 'CS401', course_code: 'CS401', department_id: 1, department_code: 'CS', semester: 4, credits: 4, faculty: 'Prof. Anil Sharma' },
  { id: 4, name: 'Computer Networks', course_name: 'Computer Networks', code: 'CS402', course_code: 'CS402', department_id: 1, department_code: 'CS', semester: 4, credits: 3, faculty: 'Prof. Rajesh Kumar' },
  { id: 5, name: 'Web Technologies', course_name: 'Web Technologies', code: 'CS501', course_code: 'CS501', department_id: 1, department_code: 'CS', semester: 5, credits: 3, faculty: 'Prof. Sunita Bose' },
  { id: 6, name: 'Machine Learning', course_name: 'Machine Learning', code: 'CS502', course_code: 'CS502', department_id: 1, department_code: 'CS', semester: 5, credits: 4, faculty: 'Prof. Deepak Patel' },
  { id: 7, name: 'Circuit Analysis', course_name: 'Circuit Analysis', code: 'EC301', course_code: 'EC301', department_id: 2, department_code: 'EC', semester: 3, credits: 4, faculty: 'Prof. Nisha Rao' },
  { id: 8, name: 'Signals & Systems', course_name: 'Signals & Systems', code: 'EC302', course_code: 'EC302', department_id: 2, department_code: 'EC', semester: 3, credits: 4, faculty: 'Prof. Kiran Desai' },
];

export const MOCK_STUDENTS = [
  { id: 1, name: 'Aarav Singh', roll_number: 'CS2021001', email: 'student1@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 5, phone: '9876543210', attendance_pct: 87.5, fee_status: 'paid', cgpa: 8.4, admission_year: 2021 },
  { id: 2, name: 'Ananya Patel', roll_number: 'CS2021002', email: 'student2@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 5, phone: '9876543211', attendance_pct: 72.3, fee_status: 'partial', cgpa: 7.9, admission_year: 2021 },
  { id: 3, name: 'Arjun Reddy', roll_number: 'CS2021003', email: 'student3@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 5, phone: '9876543212', attendance_pct: 91.2, fee_status: 'paid', cgpa: 9.1, admission_year: 2021 },
  { id: 4, name: 'Priya Nair', roll_number: 'CS2021004', email: 'student4@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 5, phone: '9876543213', attendance_pct: 58.0, fee_status: 'pending', cgpa: 6.5, admission_year: 2021 },
  { id: 5, name: 'Rohan Mehta', roll_number: 'CS2021005', email: 'student5@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 5, phone: '9876543214', attendance_pct: 95.0, fee_status: 'paid', cgpa: 9.5, admission_year: 2021 },
  { id: 6, name: 'Kavya Sharma', roll_number: 'EC2021001', email: 'student6@erp.com', department: 'Electronics Engineering', department_id: 2, department_code: 'EC', semester: 5, phone: '9876543215', attendance_pct: 83.7, fee_status: 'paid', cgpa: 8.1, admission_year: 2021 },
  { id: 7, name: 'Vikram Yadav', roll_number: 'EC2021002', email: 'student7@erp.com', department: 'Electronics Engineering', department_id: 2, department_code: 'EC', semester: 5, phone: '9876543216', attendance_pct: 67.4, fee_status: 'partial', cgpa: 7.2, admission_year: 2021 },
  { id: 8, name: 'Sneha Gupta', roll_number: 'ME2021001', email: 'student8@erp.com', department: 'Mechanical Engineering', department_id: 3, department_code: 'ME', semester: 5, phone: '9876543217', attendance_pct: 88.9, fee_status: 'paid', cgpa: 8.7, admission_year: 2021 },
  { id: 9, name: 'Karan Joshi', roll_number: 'IT2021001', email: 'student9@erp.com', department: 'Information Technology', department_id: 5, department_code: 'IT', semester: 5, phone: '9876543218', attendance_pct: 79.2, fee_status: 'pending', cgpa: 7.6, admission_year: 2021 },
  { id: 10, name: 'Deepika Pillai', roll_number: 'CE2021001', email: 'student10@erp.com', department: 'Civil Engineering', department_id: 4, department_code: 'CE', semester: 5, phone: '9876543219', attendance_pct: 93.1, fee_status: 'paid', cgpa: 9.0, admission_year: 2021 },
  { id: 11, name: 'Rahul Verma', roll_number: 'CS2021006', email: 'student11@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 3, phone: '9876543220', attendance_pct: 76.5, fee_status: 'paid', cgpa: 7.8, admission_year: 2022 },
  { id: 12, name: 'Pooja Iyer', roll_number: 'CS2021007', email: 'student12@erp.com', department: 'Computer Science', department_id: 1, department_code: 'CS', semester: 3, phone: '9876543221', attendance_pct: 88.0, fee_status: 'paid', cgpa: 8.3, admission_year: 2022 },
  { id: 13, name: 'Amit Bose', roll_number: 'EC2021003', email: 'student13@erp.com', department: 'Electronics Engineering', department_id: 2, department_code: 'EC', semester: 3, phone: '9876543222', attendance_pct: 62.1, fee_status: 'pending', cgpa: 6.8, admission_year: 2022 },
  { id: 14, name: 'Sanya Desai', roll_number: 'ME2021002', email: 'student14@erp.com', department: 'Mechanical Engineering', department_id: 3, department_code: 'ME', semester: 3, phone: '9876543223', attendance_pct: 90.5, fee_status: 'paid', cgpa: 8.9, admission_year: 2022 },
  { id: 15, name: 'Nikhil Rao', roll_number: 'IT2021002', email: 'student15@erp.com', department: 'Information Technology', department_id: 5, department_code: 'IT', semester: 3, phone: '9876543224', attendance_pct: 84.3, fee_status: 'partial', cgpa: 8.0, admission_year: 2022 },
];

export const MOCK_ATTENDANCE_ENTRIES = [
  { id: 1, student_id: 1, roll_number: 'CS2021001', student_name: 'Aarav Singh', course_id: 5, course_code: 'CS501', course_name: 'Web Technologies', total_classes: 40, classes_attended: 35, percentage: 87.5 },
  { id: 2, student_id: 2, roll_number: 'CS2021002', student_name: 'Ananya Patel', course_id: 5, course_code: 'CS501', course_name: 'Web Technologies', total_classes: 40, classes_attended: 29, percentage: 72.5 },
  { id: 3, student_id: 3, roll_number: 'CS2021003', student_name: 'Arjun Reddy', course_id: 5, course_code: 'CS501', course_name: 'Web Technologies', total_classes: 40, classes_attended: 37, percentage: 92.5 },
  { id: 4, student_id: 4, roll_number: 'CS2021004', student_name: 'Priya Nair', course_id: 5, course_code: 'CS501', course_name: 'Web Technologies', total_classes: 40, classes_attended: 23, percentage: 57.5 },
  { id: 5, student_id: 5, roll_number: 'CS2021005', student_name: 'Rohan Mehta', course_id: 5, course_code: 'CS501', course_name: 'Web Technologies', total_classes: 40, classes_attended: 38, percentage: 95.0 },
  { id: 6, student_id: 1, roll_number: 'CS2021001', student_name: 'Aarav Singh', course_id: 6, course_code: 'CS502', course_name: 'Machine Learning', total_classes: 38, classes_attended: 33, percentage: 86.8 },
  { id: 7, student_id: 11, roll_number: 'CS2021006', student_name: 'Rahul Verma', course_id: 1, course_code: 'CS301', course_name: 'Data Structures', total_classes: 36, classes_attended: 28, percentage: 77.8 },
  { id: 8, student_id: 12, roll_number: 'CS2021007', student_name: 'Pooja Iyer', course_id: 1, course_code: 'CS301', course_name: 'Data Structures', total_classes: 36, classes_attended: 32, percentage: 88.9 },
  { id: 9, student_id: 6, roll_number: 'EC2021001', student_name: 'Kavya Sharma', course_id: 7, course_code: 'EC301', course_name: 'Circuit Analysis', total_classes: 40, classes_attended: 34, percentage: 85.0 },
];

export const MOCK_ATTENDANCE = [
  { id: 1, student_id: 1, student_name: 'Aarav Singh', course: 'Web Technologies', course_code: 'CS501', date: '2026-09-01', status: 'present', marked_by: 'Prof. Rajesh Kumar' },
  { id: 2, student_id: 1, student_name: 'Aarav Singh', course: 'Web Technologies', course_code: 'CS501', date: '2026-09-02', status: 'present', marked_by: 'Prof. Rajesh Kumar' },
  { id: 3, student_id: 1, student_name: 'Aarav Singh', course: 'Web Technologies', course_code: 'CS501', date: '2026-09-03', status: 'absent', marked_by: 'Prof. Rajesh Kumar' },
  { id: 4, student_id: 1, student_name: 'Aarav Singh', course: 'Machine Learning', course_code: 'CS502', date: '2026-09-01', status: 'present', marked_by: 'Prof. Deepak Patel' },
  { id: 5, student_id: 1, student_name: 'Aarav Singh', course: 'Machine Learning', course_code: 'CS502', date: '2026-09-02', status: 'present', marked_by: 'Prof. Deepak Patel' },
];

export const MOCK_FEES = [
  { id: 1, student_id: 1, student_name: 'Aarav Singh', roll_number: 'CS2021001', fee_type: 'Tuition Fee', amount: 75000, amount_paid: 75000, amount_due: 0, status: 'paid', due_date: '2026-07-31', paid_date: '2026-07-15', semester: 5 },
  { id: 2, student_id: 1, student_name: 'Aarav Singh', roll_number: 'CS2021001', fee_type: 'Library Fee', amount: 2000, amount_paid: 2000, amount_due: 0, status: 'paid', due_date: '2026-07-31', paid_date: '2026-07-15', semester: 5 },
  { id: 3, student_id: 2, student_name: 'Ananya Patel', roll_number: 'CS2021002', fee_type: 'Tuition Fee', amount: 75000, amount_paid: 40000, amount_due: 35000, status: 'partial', due_date: '2026-07-31', paid_date: null, semester: 5 },
  { id: 4, student_id: 3, student_name: 'Arjun Reddy', roll_number: 'CS2021003', fee_type: 'Tuition Fee', amount: 75000, amount_paid: 75000, amount_due: 0, status: 'paid', due_date: '2026-07-31', paid_date: '2026-07-10', semester: 5 },
  { id: 5, student_id: 4, student_name: 'Priya Nair', roll_number: 'CS2021004', fee_type: 'Tuition Fee', amount: 75000, amount_paid: 0, amount_due: 75000, status: 'pending', due_date: '2026-07-31', paid_date: null, semester: 5 },
  { id: 6, student_id: 5, student_name: 'Rohan Mehta', roll_number: 'CS2021005', fee_type: 'Tuition Fee', amount: 75000, amount_paid: 75000, amount_due: 0, status: 'paid', due_date: '2026-07-31', paid_date: '2026-07-05', semester: 5 },
  { id: 7, student_id: 6, student_name: 'Kavya Sharma', roll_number: 'EC2021001', fee_type: 'Tuition Fee', amount: 70000, amount_paid: 70000, amount_due: 0, status: 'paid', due_date: '2026-07-31', paid_date: '2026-07-20', semester: 5 },
  { id: 8, student_id: 7, student_name: 'Vikram Yadav', roll_number: 'EC2021002', fee_type: 'Tuition Fee', amount: 70000, amount_paid: 35000, amount_due: 35000, status: 'partial', due_date: '2026-07-31', paid_date: null, semester: 5 },
];

export const MOCK_EXAMS = [
  { id: 1, name: 'Mid Semester Exam - Sem 5', exam_name: 'Mid Semester Exam - Sem 5', course: 'Web Technologies', course_code: 'CS501', exam_date: '2026-09-15', max_marks: 50, exam_type: 'midterm', semester: 5 },
  { id: 2, name: 'Mid Semester Exam - Sem 5', exam_name: 'Mid Semester Exam - Sem 5', course: 'Machine Learning', course_code: 'CS502', exam_date: '2026-09-17', max_marks: 50, exam_type: 'midterm', semester: 5 },
  { id: 3, name: 'End Semester Exam - Sem 4', exam_name: 'End Semester Exam - Sem 4', course: 'Computer Networks', course_code: 'CS402', exam_date: '2026-05-10', max_marks: 100, exam_type: 'final', semester: 4 },
  { id: 4, name: 'End Semester Exam - Sem 4', exam_name: 'End Semester Exam - Sem 4', course: 'Operating Systems', course_code: 'CS401', exam_date: '2026-05-12', max_marks: 100, exam_type: 'final', semester: 4 },
  { id: 5, name: 'End Semester Exam - Sem 3', exam_name: 'End Semester Exam - Sem 3', course: 'Data Structures', course_code: 'CS301', exam_date: '2025-12-05', max_marks: 100, exam_type: 'final', semester: 3 },
  { id: 6, name: 'End Semester Exam - Sem 3', exam_name: 'End Semester Exam - Sem 3', course: 'Database Management', course_code: 'CS302', exam_date: '2025-12-08', max_marks: 100, exam_type: 'final', semester: 3 },
];

export const MOCK_RESULTS = [
  { id: 1, student_id: 1, student_name: 'Aarav Singh', roll_number: 'CS2021001', exam_id: 3, exam_name: 'End Semester Exam - Sem 4', course: 'Computer Networks', course_id: 4, marks: 85, marks_obtained: 85, max_marks: 100, percentage: 85, grade: 'A', grade_points: 9.0, semester: 4 },
  { id: 2, student_id: 1, student_name: 'Aarav Singh', roll_number: 'CS2021001', exam_id: 4, exam_name: 'End Semester Exam - Sem 4', course: 'Operating Systems', course_id: 3, marks: 78, marks_obtained: 78, max_marks: 100, percentage: 78, grade: 'B+', grade_points: 8.0, semester: 4 },
  { id: 3, student_id: 1, student_name: 'Aarav Singh', roll_number: 'CS2021001', exam_id: 5, exam_name: 'End Semester Exam - Sem 3', course: 'Data Structures', course_id: 1, marks: 92, marks_obtained: 92, max_marks: 100, percentage: 92, grade: 'A+', grade_points: 10.0, semester: 3 },
  { id: 4, student_id: 1, student_name: 'Aarav Singh', roll_number: 'CS2021001', exam_id: 6, exam_name: 'End Semester Exam - Sem 3', course: 'Database Management', course_id: 2, marks: 88, marks_obtained: 88, max_marks: 100, percentage: 88, grade: 'A', grade_points: 9.0, semester: 3 },
  { id: 5, student_id: 2, student_name: 'Ananya Patel', roll_number: 'CS2021002', exam_id: 3, exam_name: 'End Semester Exam - Sem 4', course: 'Computer Networks', course_id: 4, marks: 72, marks_obtained: 72, max_marks: 100, percentage: 72, grade: 'B', grade_points: 7.0, semester: 4 },
  { id: 6, student_id: 2, student_name: 'Ananya Patel', roll_number: 'CS2021002', exam_id: 4, exam_name: 'End Semester Exam - Sem 4', course: 'Operating Systems', course_id: 3, marks: 68, marks_obtained: 68, max_marks: 100, percentage: 68, grade: 'C', grade_points: 6.0, semester: 4 },
  { id: 7, student_id: 3, student_name: 'Arjun Reddy', roll_number: 'CS2021003', exam_id: 3, exam_name: 'End Semester Exam - Sem 4', course: 'Computer Networks', course_id: 4, marks: 95, marks_obtained: 95, max_marks: 100, percentage: 95, grade: 'A+', grade_points: 10.0, semester: 4 },
  { id: 8, student_id: 4, student_name: 'Priya Nair', roll_number: 'CS2021004', exam_id: 3, exam_name: 'End Semester Exam - Sem 4', course: 'Computer Networks', course_id: 4, marks: 55, marks_obtained: 55, max_marks: 100, percentage: 55, grade: 'D', grade_points: 5.0, semester: 4 },
  { id: 9, student_id: 5, student_name: 'Rohan Mehta', roll_number: 'CS2021005', exam_id: 3, exam_name: 'End Semester Exam - Sem 4', course: 'Computer Networks', course_id: 4, marks: 98, marks_obtained: 98, max_marks: 100, percentage: 98, grade: 'A+', grade_points: 10.0, semester: 4 },
];

export const MOCK_DASHBOARD_STATS = {
  admin: {
    totalStudents: 750,
    totalFaculty: 45,
    totalDepartments: 5,
    totalCourses: 38,
    feeCollected: 4250000,
    feePending: 875000,
    attendanceAvg: 82.4,
    resultsPublished: 6,
  },
  faculty: {
    myStudents: 120,
    myCourses: 3,
    attendanceMarkedToday: 85,
    avgAttendance: 78.5,
    resultsEntered: 240,
    pendingResults: 12,
  },
  student: {
    cgpa: 8.4,
    attendancePct: 87.5,
    feeStatus: 'Paid',
    activeCourses: 5,
    totalCredits: 18,
    backlogs: 0,
  },
};
