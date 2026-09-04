# 📚 College ERP — API Documentation

This document outlines the complete REST API contract for the **ERP-Based Integrated Student Management System**.

- **Base URL:** `http://localhost:5000`
- **Authentication:** All protected endpoints require a JWT token passed via the HTTP Header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Roles:** `admin`, `faculty`, `student`

---

## 📌 Table of Contents
1. [Health Check](#1-health-check)
2. [Authentication APIs](#2-authentication-apis)
3. [Student Management APIs](#3-student-management-apis)
4. [Attendance APIs](#4-attendance-apis)
5. [Fee Management APIs](#5-fee-management-apis)
6. [Examination APIs](#6-examination-apis)
7. [Result Management APIs](#7-result-management-apis)
8. [Reporting APIs (PDF & Excel)](#8-reporting-apis-pdf--excel)

---

## 1. Health Check

### `GET /api/health`
Checks server responsiveness.
- **Authentication:** Not required
- **Allowed Roles:** Public
- **Request Body:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "ERP backend is running"
  }
  ```

---

## 2. Authentication APIs

### `POST /api/auth/login`
Authenticates a user and issues a JSON Web Token (JWT).
- **Authentication:** Not required
- **Allowed Roles:** Public
- **Request Body:**
  ```json
  {
    "email": "student1@erp.com",
    "password": "Student@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "role": "student",
    "user": {
      "id": 7,
      "name": "Aditi Sharma",
      "email": "student1@erp.com",
      "role": "student",
      "student_id": 1,
      "roll_number": "CSE2024001",
      "department": "Computer Science and Engineering",
      "department_code": "CSE",
      "semester": 1
    }
  }
  ```
- **Possible Errors:**
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid email or password.

---

### `GET /api/auth/me`
Fetches the currently authenticated user's profile and resolved role context.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student`
- **Request Body:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 7,
      "name": "Aditi Sharma",
      "email": "student1@erp.com",
      "role": "student",
      "student_id": 1,
      "roll_number": "CSE2024001",
      "department_id": 1,
      "semester": 1
    }
  }
  ```
- **Possible Errors:**
  - `401 Unauthorized`: Token missing, invalid, or expired.

---

## 3. Student Management APIs

### `GET /api/students`
Lists students with optional query filters.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Query Parameters:**
  - `department_id` (optional): Filter by department ID.
  - `semester` (optional): Filter by semester number (1-8).
  - `search` (optional): Keyword search on student name, email, or roll number.
- **Request Body:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 50,
    "data": [
      {
        "id": 1,
        "user_id": 7,
        "roll_number": "CSE2024001",
        "semester": 1,
        "phone": "+91 98765 00000",
        "date_of_birth": "2004-01-01T00:00:00.000Z",
        "address": "12, Lotus Enclave, Near Tech Park, Bengaluru, Karnataka",
        "admission_year": 2024,
        "name": "Aditi Sharma",
        "email": "student1@erp.com",
        "department_id": 1,
        "department_name": "Computer Science and Engineering",
        "department_code": "CSE"
      }
    ]
  }
  ```
- **Possible Errors:**
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: User role is `student`.

---

### `GET /api/students/:id`
Retrieves a specific student by student ID.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student` (only if `:id` matches own `student_id`)
- **Request Body:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "user_id": 7,
      "roll_number": "CSE2024001",
      "semester": 1,
      "phone": "+91 98765 00000",
      "date_of_birth": "2004-01-01T00:00:00.000Z",
      "address": "12, Lotus Enclave, Near Tech Park, Bengaluru, Karnataka",
      "admission_year": 2024,
      "name": "Aditi Sharma",
      "email": "student1@erp.com",
      "department_id": 1,
      "department_name": "Computer Science and Engineering",
      "department_code": "CSE"
    }
  }
  ```
- **Possible Errors:**
  - `403 Forbidden`: Student attempting to access another student's ID.
  - `404 Not Found`: Student ID does not exist.

---

### `GET /api/students/:id/profile`
Retrieves a complete academic profile including personal info, attendance summary, fee balances, and exam grades.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student` (only for own `student_id`)
- **Request Body:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "personal_info": { "id": 1, "name": "Aditi Sharma", "roll_number": "CSE2024001", ... },
      "attendance": {
        "overall_percentage": 88.89,
        "total_classes": 45,
        "attended_classes": 40,
        "records": [ ... ]
      },
      "fees": {
        "total_fee": 75000,
        "total_paid": 75000,
        "total_due": 0,
        "records": [ ... ]
      },
      "results": [ ... ]
    }
  }
  ```
- **Possible Errors:**
  - `403 Forbidden`: Unauthorized role or student ID mismatch.
  - `404 Not Found`: Student does not exist.

---

### `POST /api/students`
Creates a user account and linked student record atomically.
- **Authentication:** Required
- **Allowed Roles:** `admin`
- **Request Body:**
  ```json
  {
    "name": "Kavya Patel",
    "email": "kavya@erp.com",
    "password": "Password@123",
    "roll_number": "CSE2024055",
    "department_id": 1,
    "semester": 1,
    "phone": "+91 98765 43210",
    "date_of_birth": "2005-04-12",
    "address": "45 Park Avenue, Mumbai",
    "admission_year": 2024
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Student registered successfully.",
    "data": {
      "id": 51,
      "user_id": 57,
      "roll_number": "CSE2024055",
      "department_id": 1,
      "semester": 1,
      "name": "Kavya Patel",
      "email": "kavya@erp.com"
    }
  }
  ```
- **Possible Errors:**
  - `400 Bad Request`: Missing mandatory fields or duplicate roll number/email.
  - `403 Forbidden`: Non-admin caller.

---

### `PUT /api/students/:id`
Updates student details.
- **Authentication:** Required
- **Allowed Roles:** `admin`
- **Request Body:**
  ```json
  {
    "phone": "+91 99999 11111",
    "semester": 2,
    "address": "New Flat 101, Indiranagar, Bengaluru"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student record updated successfully.",
    "data": { ... }
  }
  ```

---

### `DELETE /api/students/:id`
Deletes a student record and their associated user login.
- **Authentication:** Required
- **Allowed Roles:** `admin`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student with ID 1 deleted successfully."
  }
  ```

---

## 4. Attendance APIs

### `GET /api/attendance/student/:studentId`
Retrieves attendance records for a student across all enrolled courses.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student` (only for own `studentId`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "summary": {
      "total_courses": 1,
      "total_classes": 45,
      "classes_attended": 40,
      "overall_percentage": 88.89
    },
    "data": [
      {
        "id": 1,
        "student_id": 1,
        "roll_number": "CSE2024001",
        "student_name": "Aditi Sharma",
        "course_id": 1,
        "course_code": "CS101",
        "course_name": "Introduction to Programming",
        "total_classes": 45,
        "classes_attended": 40,
        "percentage": 88.89
      }
    ]
  }
  ```

---

### `GET /api/attendance/course/:courseId`
Retrieves attendance across all students enrolled in a specific course.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "course": { "id": 1, "course_code": "CS101", "course_name": "Introduction to Programming" },
    "count": 10,
    "data": [ ... ]
  }
  ```

---

### `POST /api/attendance`
Records or updates attendance. The percentage is calculated automatically on the server.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Request Body:**
  ```json
  {
    "student_id": 1,
    "course_id": 1,
    "total_classes": 40,
    "classes_attended": 35
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Attendance record saved successfully.",
    "data": {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "total_classes": 40,
      "classes_attended": 35,
      "percentage": 87.50,
      "updated_at": "2026-09-05T02:30:00.000Z"
    }
  }
  ```
- **Possible Errors:**
  - `400 Bad Request`: `classes_attended > total_classes` or negative numbers.

---

### `PUT /api/attendance/:id`
Updates an existing attendance entry. Recomputes percentage automatically.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Request Body:**
  ```json
  {
    "total_classes": 42,
    "classes_attended": 38
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Attendance record updated successfully.",
    "data": { ... }
  }
  ```

---

## 5. Fee Management APIs

### `GET /api/fees/student/:studentId`
Retrieves fee obligations, payments, and balances for a student.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `student` (only for own `studentId`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "student": { "id": 1, "roll_number": "CSE2024001", "name": "Aditi Sharma" },
    "summary": {
      "total_invoiced": 75000,
      "total_paid": 75000,
      "total_due": 0
    },
    "data": [
      {
        "id": 1,
        "student_id": 1,
        "semester": 1,
        "total_fee": 75000.00,
        "amount_paid": 75000.00,
        "amount_due": 0.00,
        "status": "PAID",
        "due_date": "2025-04-30"
      }
    ]
  }
  ```

---

### `GET /api/fees`
Retrieves institutional fee records across all students.
- **Authentication:** Required
- **Allowed Roles:** `admin`
- **Query Parameters:** `status` (`PAID`, `PARTIAL`, `PENDING`), `semester`, `search`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "summary": {
      "total_records": 50,
      "total_collected": 2100000.00,
      "total_outstanding": 1650000.00
    },
    "data": [ ... ]
  }
  ```

---

### `POST /api/fees`
Issues a fee invoice. `amount_due` and `status` are automatically calculated.
- **Authentication:** Required
- **Allowed Roles:** `admin`
- **Request Body:**
  ```json
  {
    "student_id": 1,
    "semester": 2,
    "total_fee": 75000.00,
    "amount_paid": 25000.00,
    "due_date": "2025-10-31"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Fee record created successfully.",
    "data": {
      "id": 51,
      "student_id": 1,
      "semester": 2,
      "total_fee": 75000.00,
      "amount_paid": 25000.00,
      "amount_due": 50000.00,
      "status": "PARTIAL",
      "due_date": "2025-10-31"
    }
  }
  ```
- **Possible Errors:**
  - `400 Bad Request`: `amount_paid > total_fee` or negative amounts.

---

### `PUT /api/fees/:id`
Records a fee payment or fee adjustment. Recalculates `amount_due` and updates status (`PAID` / `PARTIAL` / `PENDING`).
- **Authentication:** Required
- **Allowed Roles:** `admin`
- **Request Body:**
  ```json
  {
    "amount_paid": 75000.00
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Fee record updated successfully.",
    "data": {
      "id": 51,
      "total_fee": 75000.00,
      "amount_paid": 75000.00,
      "amount_due": 0.00,
      "status": "PAID"
    }
  }
  ```

---

## 6. Examination APIs

### `GET /api/exams`
Lists scheduled examinations.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student`
- **Query Parameters:** `semester` (optional).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 6,
    "data": [
      {
        "id": 1,
        "name": "Mid-Term Exam Fall 2024",
        "semester": 3,
        "exam_date": "2024-10-15T00:00:00.000Z"
      }
    ]
  }
  ```

---

### `GET /api/exams/:id`
Retrieves a specific exam.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student`

---

### `POST /api/exams`
Schedules a new examination.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Request Body:**
  ```json
  {
    "name": "End-Semester Spring 2025",
    "semester": 2,
    "exam_date": "2025-05-20"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Exam created successfully.",
    "data": { "id": 7, "name": "End-Semester Spring 2025", "semester": 2, "exam_date": "2025-05-20" }
  }
  ```

---

### `PUT /api/exams/:id`
Modifies an existing examination schedule.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`

---

### `DELETE /api/exams/:id`
Deletes an examination.
- **Authentication:** Required
- **Allowed Roles:** `admin`

---

## 7. Result Management APIs

### `GET /api/results/student/:studentId`
Retrieves academic performance records for a student.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`, `student` (only for own `studentId`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "student": { "id": 1, "roll_number": "CSE2024001", "name": "Aditi Sharma", "department_name": "Computer Science and Engineering" },
    "summary": {
      "total_subjects": 1,
      "average_marks": 88.00
    },
    "data": [
      {
        "id": 1,
        "exam_name": "Mid-Term Exam Fall 2024",
        "course_code": "CS101",
        "course_name": "Introduction to Programming",
        "credits": 4,
        "marks": 88.00,
        "grade": "A"
      }
    ]
  }
  ```

---

### `GET /api/results/exam/:examId`
Retrieves marks and grades of all students for an exam.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "exam": { "id": 1, "name": "Mid-Term Exam Fall 2024" },
    "count": 25,
    "data": [ ... ]
  }
  ```

---

### `POST /api/results`
Enters exam marks. The letter grade is calculated automatically on the server.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Request Body:**
  ```json
  {
    "student_id": 1,
    "course_id": 1,
    "exam_id": 1,
    "marks": 94.5
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Result recorded successfully.",
    "data": {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "exam_id": 1,
      "marks": 94.50,
      "grade": "A+",
      "created_at": "2026-09-05T02:30:00.000Z"
    }
  }
  ```
- **Grade Scale:**
  - 90–100: `A+`
  - 80–89: `A`
  - 70–79: `B+`
  - 60–69: `B`
  - 50–59: `C`
  - 40–49: `D`
  - Below 40: `F`
- **Possible Errors:**
  - `400 Bad Request`: Marks not between 0 and 100.

---

### `PUT /api/results/:id`
Updates marks and recalculates grade.
- **Authentication:** Required
- **Allowed Roles:** `admin`, `faculty`
- **Request Body:**
  ```json
  {
    "marks": 78
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Result updated successfully.",
    "data": {
      "id": 1,
      "marks": 78.00,
      "grade": "B+"
    }
  }
  ```

---

### `DELETE /api/results/:id`
Deletes a result entry.
- **Authentication:** Required
- **Allowed Roles:** `admin`

---

## 8. Reporting APIs (PDF & Excel)

### PDF Endpoints (PDFKit)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/reports/student/:studentId/pdf` | `admin`, `faculty`, `student` (own) | Official PDF Report Card with Profile, Attendance, Fees, and Results. |
| `GET` | `/api/reports/attendance/pdf` | `admin`, `faculty` | Department & Course Attendance Register PDF. |
| `GET` | `/api/reports/fees/pdf` | `admin` | Institutional Fee Collection & Audit Report PDF with billing totals. |
| `GET` | `/api/reports/results/pdf` | `admin`, `faculty` | Tabulated Examination Results Sheet PDF. |

### Excel Endpoints (ExcelJS)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/reports/students/excel` | `admin`, `faculty` | Master student roster Excel sheet with all biographical and academic details. |
| `GET` | `/api/reports/attendance/excel` | `admin`, `faculty` | Complete attendance tracking ledger workbook with course percentages. |
| `GET` | `/api/reports/fees/excel` | `admin` | Fee audit workbook with amount billed, paid, due, and automated sum totals. |
| `GET` | `/api/reports/results/excel` | `admin`, `faculty` | Examination results workbook with scores and letter grades. |
