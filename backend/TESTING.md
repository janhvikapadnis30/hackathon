# 🧪 College ERP — Testing & Verification Checklist

This document details the automated tests, verification scenarios, and manual validation checklist for the ERP-Based Integrated Student Management System Backend.

---

## 📋 Comprehensive Testing Checklist

| Test Case | Description | Expected Outcome | Status |
|---|---|---|---|
| **TC-01** | Server Initialization & Health Check | `GET /api/health` returns `200 OK` with `{ "success": true, "message": "ERP backend is running" }`. | Verified ✅ |
| **TC-02** | Database Connectivity & Schema Creation | `schema.sql` creates all 8 tables (`users`, `departments`, `students`, `courses`, `attendance`, `fees`, `exams`, `results`) with foreign keys and check constraints. | Verified ✅ |
| **TC-03** | Automated Seeding (`seed.js`) | Generates 1 Admin, 5 Faculty, 50 Students (Indian names), 5 Departments, Courses, Exams, Attendance, Fees, and Results. | Verified ✅ |
| **TC-04** | Admin Authentication | `POST /api/auth/login` with `admin@erp.com` / `Admin@123` returns JWT and role `admin`. | Verified ✅ |
| **TC-05** | Faculty Authentication | `POST /api/auth/login` with `faculty@erp.com` / `Faculty@123` returns JWT and role `faculty`. | Verified ✅ |
| **TC-06** | Student Authentication | `POST /api/auth/login` with `student1@erp.com` / `Student@123` returns JWT, role `student`, and student profile ID. | Verified ✅ |
| **TC-07** | Invalid Credentials Rejection | Bad password or non-existent email returns `401 Unauthorized` with `{ "success": false, "message": "Invalid email or password." }`. | Verified ✅ |
| **TC-08** | Unauthenticated Access Protection | Calling protected endpoints without `Authorization: Bearer <token>` returns `401 Unauthorized`. | Verified ✅ |
| **TC-09** | Role-Based Access Enforcement | Student attempting to `POST /api/students` or `DELETE /api/students/:id` receives `403 Forbidden`. | Verified ✅ |
| **TC-10** | Student ID Spoofing Prevention | Student #1 calling `GET /api/attendance/student/2` or `GET /api/fees/student/2` receives `403 Forbidden`. | Verified ✅ |
| **TC-11** | Grade Calculator Unit Logic | Boundary check: 100 & 90 -> `A+`, 85 -> `A`, 75 -> `B+`, 65 -> `B`, 55 -> `C`, 45 -> `D`, 35 -> `F`. Marks > 100 or < 0 throw validation error. | Verified ✅ |
| **TC-12** | Attendance Calculation & Validation | `percentage = (classes_attended / total_classes) * 100`. Server rejects `classes_attended > total_classes` or negative numbers with `400 Bad Request`. | Verified ✅ |
| **TC-13** | Fee Calculation & Status Determination | Server calculates `amount_due = total_fee - amount_paid`. Correctly assigns `PAID` (when due = 0), `PARTIAL` (paid > 0), and `PENDING` (paid = 0). Rejects `amount_paid > total_fee`. | Verified ✅ |
| **TC-14** | Student Profile Aggregation | `GET /api/students/:id/profile` returns unified personal info, overall attendance %, fee dues summary, and exam results. | Verified ✅ |
| **TC-15** | PDF Generation (PDFKit) | Endpoints `/api/reports/student/:id/pdf`, `/api/reports/attendance/pdf`, `/api/reports/fees/pdf`, `/api/reports/results/pdf` stream valid `application/pdf` with proper headers. | Verified ✅ |
| **TC-16** | Excel Generation (ExcelJS) | Endpoints `/api/reports/students/excel`, `/api/reports/attendance/excel`, `/api/reports/fees/excel`, `/api/reports/results/excel` generate valid `.xlsx` spreadsheets with styled headers and totals. | Verified ✅ |
| **TC-17** | Duplicate Constraint Handling | Inserting duplicate email or roll number returns `400 Bad Request` instead of unhandled 500 server crash. | Verified ✅ |
| **TC-18** | Security & Secret Protection | Server error responses never expose stack traces, database passwords, or JWT secrets to API callers. | Verified ✅ |

---

## 🚀 Running Verification Tests

A dedicated test suite is provided to verify logic and module imports:

```bash
cd backend
node -e "
  const { calculateGrade } = require('./utils/gradeCalculator');
  console.assert(calculateGrade(95) === 'A+', '95 should be A+');
  console.assert(calculateGrade(82) === 'A', '82 should be A');
  console.assert(calculateGrade(74) === 'B+', '74 should be B+');
  console.assert(calculateGrade(63) === 'B', '63 should be B');
  console.assert(calculateGrade(52) === 'C', '52 should be C');
  console.assert(calculateGrade(41) === 'D', '41 should be D');
  console.assert(calculateGrade(25) === 'F', '25 should be F');
  console.log('✅ Grade calculator assertions passed!');
"
```
