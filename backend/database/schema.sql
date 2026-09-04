-- =============================================================================
-- ERP-Based Integrated Student Management System - Database Schema
-- Database: student_erp
-- =============================================================================

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Authentication & Base identity)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL
);

-- 3. Students Table (Extends user with student-specific academic & personal details)
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    admission_year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(30) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    credits INT NOT NULL DEFAULT 3 CHECK (credits > 0)
);

-- 5. Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    total_classes INT NOT NULL CHECK (total_classes >= 0),
    classes_attended INT NOT NULL CHECK (classes_attended >= 0),
    percentage NUMERIC(5,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_classes CHECK (classes_attended <= total_classes),
    CONSTRAINT uq_student_course UNIQUE (student_id, course_id)
);

-- 6. Fees Table
CREATE TABLE fees (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    total_fee NUMERIC(10,2) NOT NULL CHECK (total_fee >= 0),
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    amount_due NUMERIC(10,2) NOT NULL CHECK (amount_due >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PAID', 'PARTIAL', 'PENDING')),
    due_date DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fee_payment CHECK (amount_paid <= total_fee),
    CONSTRAINT uq_student_semester_fee UNIQUE (student_id, semester)
);

-- 7. Exams Table
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Results Table
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    marks NUMERIC(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
    grade VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_course_exam UNIQUE (student_id, course_id, exam_id)
);

-- Indexes for optimal lookup and join performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_course ON attendance(course_id);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_exam ON results(exam_id);
