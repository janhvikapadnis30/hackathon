const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { calculateGrade } = require('../utils/gradeCalculator');

const INDIAN_STUDENT_NAMES = [
  'Aditi Sharma', 'Rahul Verma', 'Priya Singh', 'Arjun Mehta', 'Neha Joshi',
  'Rohan Gupta', 'Ananya Nair', 'Siddharth Jain', 'Pooja Kulkarni', 'Manish Tiwari',
  'Sneha Reddy', 'Karan Malhotra', 'Divya Pillai', 'Aditya Saxena', 'Shreya Sen',
  'Varun Kapoor', 'Ritu Choudhury', 'Kunal Das', 'Meera Nambiar', 'Gaurav Bhatia',
  'Swati Mukherjee', 'Abhishek Mishra', 'Tanvi Agarwal', 'Nikhil Bhosle', 'Deepa Menon',
  'Harish Soni', 'Pallavi Goswami', 'Saurabh Pandey', 'Aakanksha Rawat', 'Mayank Trivedi',
  'Ishita Bansal', 'Chetan Chauhan', 'Vandana Shukla', 'Rohit Yadav', 'Bhavna Hegde',
  'Alok Tripathi', 'Preeti Gill', 'Deepak Bhatt', 'Shalini Roy', 'Mohit Mathur',
  'Nidhi Dubey', 'Akash Sengupta', 'Smriti Kaul', 'Prateek Singhal', 'Garima Anand',
  'Yash Vardhan', 'Komal Rastogi', 'Tarun Somani', 'Jyoti Negi', 'Vivek Swaminathan',
];

const CITIES = [
  'Bengaluru, Karnataka', 'Pune, Maharashtra', 'Hyderabad, Telangana',
  'New Delhi, Delhi', 'Mumbai, Maharashtra', 'Chennai, Tamil Nadu',
  'Jaipur, Rajasthan', 'Ahmedabad, Gujarat', 'Kolkata, West Bengal',
  'Lucknow, Uttar Pradesh', 'Bhopal, Madhya Pradesh', 'Chandigarh, Punjab',
];

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Database Seeding ---');

    // 1. Run schema.sql to drop & recreate clean tables
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    console.log('Schema loaded successfully.');

    // 2. Insert Departments
    console.log('Inserting Departments...');
    const departments = [
      { name: 'Computer Science and Engineering', code: 'CSE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Electronics and Communication Engineering', code: 'ECE' },
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Civil Engineering', code: 'CE' },
    ];

    const deptMap = {};
    for (const dept of departments) {
      const res = await client.query(
        'INSERT INTO departments (name, code) VALUES ($1, $2) RETURNING id, code',
        [dept.name, dept.code]
      );
      deptMap[dept.code] = res.rows[0].id;
    }

    // 3. Pre-hash passwords
    console.log('Hashing passwords...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const facultyPasswordHash = await bcrypt.hash('Faculty@123', 10);
    const studentPasswordHash = await bcrypt.hash('Student@123', 10);

    // 4. Create Admin User
    console.log('Creating Admin user...');
    await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ('System Administrator', 'admin@erp.com', $1, 'admin')`,
      [adminPasswordHash]
    );

    // 5. Create 5 Faculty Users
    console.log('Creating 5 Faculty users...');
    const facultyList = [
      { name: 'Dr. Rajesh Sharma', email: 'faculty@erp.com' },
      { name: 'Prof. Sunita Rao', email: 'faculty2@erp.com' },
      { name: 'Dr. Amit Patel', email: 'faculty3@erp.com' },
      { name: 'Prof. Vikram Deshmukh', email: 'faculty4@erp.com' },
      { name: 'Dr. Kavita Iyer', email: 'faculty5@erp.com' },
    ];

    for (const f of facultyList) {
      await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'faculty')`,
        [f.name, f.email, facultyPasswordHash]
      );
    }

    // 6. Create Courses across departments and semesters
    console.log('Creating Courses...');
    const courseDefinitions = [
      // CSE
      { code: 'CS101', name: 'Introduction to Programming', dept: 'CSE', sem: 1, cr: 4 },
      { code: 'CS201', name: 'Data Structures and Algorithms', dept: 'CSE', sem: 3, cr: 4 },
      { code: 'CS301', name: 'Database Management Systems', dept: 'CSE', sem: 5, cr: 4 },
      { code: 'CS401', name: 'Cloud Computing & Distributed Systems', dept: 'CSE', sem: 7, cr: 3 },
      // IT
      { code: 'IT101', name: 'Information Technology Fundamentals', dept: 'IT', sem: 1, cr: 3 },
      { code: 'IT201', name: 'Object Oriented Programming in Java', dept: 'IT', sem: 3, cr: 4 },
      { code: 'IT301', name: 'Web Application Engineering', dept: 'IT', sem: 5, cr: 4 },
      { code: 'IT401', name: 'Information Security & Cryptography', dept: 'IT', sem: 7, cr: 3 },
      // ECE
      { code: 'EC101', name: 'Basic Electrical & Electronics', dept: 'ECE', sem: 1, cr: 4 },
      { code: 'EC201', name: 'Signals and Systems', dept: 'ECE', sem: 3, cr: 4 },
      { code: 'EC301', name: 'Digital Signal Processing', dept: 'ECE', sem: 5, cr: 4 },
      { code: 'EC401', name: 'Embedded Systems & IoT', dept: 'ECE', sem: 7, cr: 3 },
      // ME
      { code: 'ME101', name: 'Engineering Mechanics', dept: 'ME', sem: 1, cr: 4 },
      { code: 'ME201', name: 'Thermodynamics', dept: 'ME', sem: 3, cr: 4 },
      { code: 'ME301', name: 'Fluid Mechanics & Machinery', dept: 'ME', sem: 5, cr: 4 },
      { code: 'ME401', name: 'Manufacturing Processes', dept: 'ME', sem: 7, cr: 3 },
      // CE
      { code: 'CE101', name: 'Basic Civil Engineering', dept: 'CE', sem: 1, cr: 3 },
      { code: 'CE201', name: 'Surveying & Geomatics', dept: 'CE', sem: 3, cr: 4 },
      { code: 'CE301', name: 'Structural Analysis', dept: 'CE', sem: 5, cr: 4 },
      { code: 'CE401', name: 'Transportation Engineering', dept: 'CE', sem: 7, cr: 3 },
    ];

    const courseMap = {};
    for (const c of courseDefinitions) {
      const res = await client.query(
        `INSERT INTO courses (course_code, course_name, department_id, semester, credits)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, course_code, department_id, semester`,
        [c.code, c.name, deptMap[c.dept], c.sem, c.cr]
      );
      courseMap[c.code] = res.rows[0];
    }

    // 7. Create Exams
    console.log('Creating Exams...');
    const exams = [
      { name: 'Mid-Term Exam Fall 2024', sem: 3, date: '2024-10-15' },
      { name: 'End-Semester Exam Fall 2024', sem: 3, date: '2024-12-10' },
      { name: 'Mid-Term Exam Fall 2024', sem: 5, date: '2024-10-18' },
      { name: 'End-Semester Exam Fall 2024', sem: 5, date: '2024-12-14' },
      { name: 'Mid-Term Exam Fall 2024', sem: 7, date: '2024-10-20' },
      { name: 'End-Semester Exam Fall 2024', sem: 7, date: '2024-12-18' },
    ];

    const examList = [];
    for (const ex of exams) {
      const res = await client.query(
        'INSERT INTO exams (name, semester, exam_date) VALUES ($1, $2, $3) RETURNING id, name, semester',
        [ex.name, ex.sem, ex.date]
      );
      examList.push(res.rows[0]);
    }

    // 8. Create 50 Student Users and Profiles
    console.log('Creating 50 Student Users & Profiles...');
    const deptCodes = ['CSE', 'IT', 'ECE', 'ME', 'CE'];
    const createdStudents = [];

    for (let i = 0; i < 50; i++) {
      const studentName = INDIAN_STUDENT_NAMES[i];
      const emailNumber = i + 1;
      const email = `student${emailNumber}@erp.com`;
      const deptCode = deptCodes[i % 5];
      const deptId = deptMap[deptCode];
      
      // Rotate semesters: 1, 3, 5, 7 for realism
      const semesters = [1, 3, 5, 7];
      const semester = semesters[i % semesters.length];
      const admissionYear = 2025 - Math.ceil(semester / 2);
      
      const rollNumSuffix = String(Math.floor(i / 5) + 1).padStart(3, '0');
      const rollNumber = `${deptCode}${admissionYear}${rollNumSuffix}`;

      const phone = `+91 98765 ${String(10000 + i).slice(1)}`;
      const birthYear = 2005 - Math.ceil(semester / 2);
      const birthMonth = String((i % 12) + 1).padStart(2, '0');
      const birthDay = String((i % 25) + 1).padStart(2, '0');
      const dob = `${birthYear}-${birthMonth}-${birthDay}`;
      const address = `${i + 12}, Lotus Enclave, Near Tech Park, ${CITIES[i % CITIES.length]}`;

      // Insert User
      const userRes = await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'student')
         RETURNING id`,
        [studentName, email, studentPasswordHash]
      );
      const userId = userRes.rows[0].id;

      // Insert Student
      const studentRes = await client.query(
        `INSERT INTO students (user_id, roll_number, department_id, semester, phone, date_of_birth, address, admission_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, roll_number, department_id, semester`,
        [userId, rollNumber, deptId, semester, phone, dob, address, admissionYear]
      );
      createdStudents.push(studentRes.rows[0]);
    }

    // 9. Generate Attendance records for students
    console.log('Generating Attendance records...');
    for (const student of createdStudents) {
      // Find courses belonging to student's department and semester
      const relevantCourses = Object.values(courseMap).filter(
        (c) => c.department_id === student.department_id && c.semester === student.semester
      );

      for (const course of relevantCourses) {
        const totalClasses = 45;
        // Generate realistic attended classes between 32 and 45
        const attended = Math.min(totalClasses, Math.max(28, 30 + (student.id * 3) % 16));
        const percentage = parseFloat(((attended / totalClasses) * 100).toFixed(2));

        await client.query(
          `INSERT INTO attendance (student_id, course_id, total_classes, classes_attended, percentage)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [student.id, course.id, totalClasses, attended, percentage]
        );
      }
    }

    // 10. Generate Fee records for students
    console.log('Generating Fee records...');
    for (const student of createdStudents) {
      const totalFee = 75000.00;
      let amountPaid = 0.00;
      let status = 'PENDING';

      // Distribute statuses realistically
      if (student.id % 3 === 0) {
        amountPaid = totalFee;
        status = 'PAID';
      } else if (student.id % 3 === 1) {
        amountPaid = 45000.00;
        status = 'PARTIAL';
      } else {
        amountPaid = 0.00;
        status = 'PENDING';
      }

      const amountDue = parseFloat((totalFee - amountPaid).toFixed(2));
      const dueDate = '2025-04-30';

      await client.query(
        `INSERT INTO fees (student_id, semester, total_fee, amount_paid, amount_due, status, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [student.id, student.semester, totalFee, amountPaid, amountDue, status, dueDate]
      );
    }

    // 11. Generate Examination Results
    console.log('Generating Examination Results...');
    for (const student of createdStudents) {
      // Find exams matching student's semester
      const relevantExams = examList.filter((e) => e.semester === student.semester);
      const relevantCourses = Object.values(courseMap).filter(
        (c) => c.department_id === student.department_id && c.semester === student.semester
      );

      for (const exam of relevantExams) {
        for (const course of relevantCourses) {
          // Deterministic realistic marks between 55 and 96
          const baseScore = 60 + ((student.id * 7 + course.id * 11) % 38);
          const marks = Math.min(100, Math.max(40, baseScore));
          const grade = calculateGrade(marks);

          await client.query(
            `INSERT INTO results (student_id, course_id, exam_id, marks, grade)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT DO NOTHING`,
            [student.id, course.id, exam.id, marks, grade]
          );
        }
      }
    }

    console.log('====================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('====================================================');
    console.log('Default Test Credentials:');
    console.log('  Admin:   admin@erp.com       / Admin@123');
    console.log('  Faculty: faculty@erp.com     / Faculty@123');
    console.log('  Student: student1@erp.com    / Student@123 (to student50@erp.com)');
    console.log('====================================================');
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
