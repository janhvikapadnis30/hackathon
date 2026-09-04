# 🎓 College ERP — Integrated Student Management System

A comprehensive, production-grade **College ERP Backend** designed for higher education institutions. This RESTful API system manages student admissions, role-based access control, attendance tracking, fee collection, examination schedules, grading, and automated PDF & Excel reporting.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Technologies Used](#-technologies-used)
- [Prerequisites](#-prerequisites)
- [Project Folder Structure](#-project-folder-structure)
- [Database Setup (PostgreSQL)](#-database-setup-postgresql)
- [Environment Variables](#-environment-variables)
- [Installation & Quickstart](#-installation--quickstart)
- [Database Seeding (Mock Data)](#-database-seeding-mock-data)
- [Authentication & Role-Based Access (RBAC)](#-authentication--role-based-access-rbac)
- [Default Test Credentials](#-default-test-credentials)
- [API Endpoints Summary](#-api-endpoints-summary)
- [Sample API Requests](#-sample-api-requests)
- [Reporting Features (PDF & Excel)](#-reporting-features-pdf--excel)
- [Running Verification Tests](#-running-verification-tests)

---

## 🏛 Overview & Architecture

The ERP system provides a multi-role backend with server-enforced security and calculations:

- **🔐 3 Distinct Roles:** `admin`, `faculty`, and `student`.
- **🛡️ Server-Side Security:** Strict role middleware prevents URL tampering (e.g. students cannot access another student's fees, attendance, results, or profile by modifying IDs in the URL).
- **🧮 Automatic Server Calculations:**
  - **Attendance:** Percentage is calculated automatically as `(classes_attended / total_classes) * 100`. The server rejects `classes_attended > total_classes`.
  - **Fees:** Automatically computes `amount_due = total_fee - amount_paid` and evaluates status (`PAID`, `PARTIAL`, `PENDING`).
  - **Academic Grading:** Grade calculated in [`utils/gradeCalculator.js`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/utils/gradeCalculator.js) based on standard 10-point academic scale:
    - 90–100: `A+` (10 GP)
    - 80–89: `A` (9 GP)
    - 70–79: `B+` (8 GP)
    - 60–69: `B` (7 GP)
    - 50–59: `C` (6 GP)
    - 40–49: `D` (5 GP)
    - Below 40: `F` (0 GP)
- **📄 Native Report Generation:** Instant generation of formal PDF reports via **PDFKit** and spreadsheets via **ExcelJS**.

---

## 🛠 Technologies Used

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (using the `pg` client with connection pooling)
- **Authentication:** JSON Web Tokens ([`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken))
- **Password Hashing:** [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) (Salt rounds: 10)
- **CORS:** [`cors`](https://www.npmjs.com/package/cors) configured for React local development (`localhost:3000`, `localhost:5173`)
- **Reporting:**
  - PDF Generation: [`pdfkit`](https://www.npmjs.com/package/pdfkit)
  - Spreadsheet Export: [`exceljs`](https://www.npmjs.com/package/exceljs)
- **Environment Management:** [`dotenv`](https://www.npmjs.com/package/dotenv)
- **Development Tooling:** [`nodemon`](https://www.npmjs.com/package/nodemon)

---

## 📋 Prerequisites

- **Node.js:** v18.x or later installed.
- **npm:** v9.x or later installed.
- **PostgreSQL:** Installed and running locally on port 5432.

---

## 📁 Project Folder Structure

```
hackathon/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL Pool connection & query helper
│   ├── controllers/
│   │   ├── authController.js     # Login & current user resolution
│   │   ├── studentController.js  # Student CRUD & unified profile aggregation
│   │   ├── attendanceController.js# Attendance recording & auto percentage
│   │   ├── feeController.js       # Fee ledgers, payments & auto status
│   │   ├── examController.js      # Examination scheduling & retrieval
│   │   ├── resultController.js    # Marks entry & server-side grade calculation
│   │   └── reportController.js    # PDF (PDFKit) & Excel (ExcelJS) generators
│   ├── database/
│   │   ├── schema.sql            # DDL schema (8 tables, constraints, indexes)
│   │   └── seed.js               # Mock data generator (Admin, 5 Faculty, 50 Students)
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT bearer token verification
│   │   ├── roleMiddleware.js     # Role verification & student ID ownership check
│   │   └── errorMiddleware.js    # Central error handler & database error translation
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── studentRoutes.js      # /api/students/*
│   │   ├── attendanceRoutes.js   # /api/attendance/*
│   │   ├── feeRoutes.js          # /api/fees/*
│   │   ├── examRoutes.js         # /api/exams/*
│   │   ├── resultRoutes.js       # /api/results/*
│   │   └── reportRoutes.js       # /api/reports/*
│   ├── utils/
│   │   └── gradeCalculator.js    # Grade & grade-point calculation logic
│   ├── .env.example              # Sample environment configuration
│   ├── .gitignore                # Node modules and environment ignore rules
│   ├── API_DOCUMENTATION.md      # Full REST API specification
│   ├── TESTING.md                # Test checklist and verification scenarios
│   ├── test-verify.js            # Automated verification test script
│   ├── package.json              # Project dependencies & scripts
│   └── server.js                 # Express server entrypoint & CORS setup
├── index.html                    # Frontend mock dashboard & login interface
├── style.css                     # Stylesheet for frontend interface
├── script.js                     # Frontend script for client interactions
└── README.md                     # Project documentation
```

---

## 🗄️ Database Setup (PostgreSQL)

### 1. Create the Database
Log in to your local PostgreSQL command-line utility or pgAdmin:

```bash
# Via psql terminal
psql -U postgres
```

Inside the PostgreSQL terminal:
```sql
CREATE DATABASE student_erp;
\q
```

### 2. Apply Schema DDL
You can apply [`backend/database/schema.sql`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/database/schema.sql) using `psql`:

```bash
psql -U postgres -d student_erp -f backend/database/schema.sql
```
*(Alternatively, running `npm run seed` will execute this step automatically!)*

### Database Tables Created:
1. `users` — Base user credentials, roles (`admin`, `faculty`, `student`), and timestamps.
2. `departments` — Academic departments (CSE, IT, ECE, ME, CE).
3. `students` — Extended student profile (Roll number, DOB, phone, address, admission year).
4. `courses` — Departmental subjects, semesters, and credits.
5. `attendance` — Course attendance records with total, attended, and percentage.
6. `fees` — Fee invoices with total fee, amount paid, amount due, and status (`PAID`, `PARTIAL`, `PENDING`).
7. `exams` — Semester examination schedules.
8. `results` — Examination marks (0–100) and computed letter grades (`A+` to `F`).

---

## ⚙️ Environment Variables

Inside the `backend/` directory, copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Ensure the configuration matches your local PostgreSQL credentials:

```ini
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_erp
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=student_erp_super_secret_jwt_key_2026
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

## 🚀 Installation & Quickstart

### 1. Install Dependencies
Navigate into the `backend/` directory and install the required npm packages:

```bash
cd backend
npm install
```

### 2. Seed Mock Data
Populate the database with departments, courses, exams, 1 admin, 5 faculty, and 50 realistic student records:

```bash
npm run seed
```

### 3. Start the Server

- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

The server will listen at `http://localhost:5000`. Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "ERP backend is running"
}
```

---

## 🔑 Default Test Credentials

All accounts are created with pre-hashed bcrypt passwords in [`database/seed.js`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/database/seed.js):

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@erp.com` | `Admin@123` | Full access: student CRUD, fee management, attendance, results, reports. |
| **Faculty** | `faculty@erp.com` | `Faculty@123` | Student viewing, attendance recording, marks entry, academic reports. |
| **Faculty (2–5)**| `faculty2@erp.com` to `faculty5@erp.com` | `Faculty@123` | Departmental faculty access. |
| **Student 1** | `student1@erp.com` | `Student@123` | Access **ONLY** their own profile, attendance, fees, results, and PDF report. |
| **Student (2–50)** | `student2@erp.com` to `student50@erp.com` | `Student@123` | Access **ONLY** their own records. |

---

## 📡 API Endpoints Summary

For complete schema details, payloads, and responses, see [`backend/API_DOCUMENTATION.md`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/API_DOCUMENTATION.md).

### 1. Authentication
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Get current logged-in user profile.

### 2. Students
- `GET /api/students` — List students (Admin, Faculty).
- `GET /api/students/:id` — View student by ID (Admin, Faculty, or authorized Student).
- `GET /api/students/:id/profile` — View complete integrated student profile (Admin, Faculty, or authorized Student).
- `POST /api/students` — Register a new student and user account (Admin).
- `PUT /api/students/:id` — Update student record (Admin).
- `DELETE /api/students/:id` — Delete student record (Admin).

### 3. Attendance
- `GET /api/attendance/student/:studentId` — Student attendance across courses (Admin, Faculty, or authorized Student).
- `GET /api/attendance/course/:courseId` — Course-wide attendance register (Admin, Faculty).
- `POST /api/attendance` — Record attendance with server-calculated percentage (Admin, Faculty).
- `PUT /api/attendance/:id` — Update attendance (Admin, Faculty).

### 4. Fees
- `GET /api/fees/student/:studentId` — Student fee ledger (Admin, or authorized Student).
- `GET /api/fees` — Institutional fee overview with status filters (Admin).
- `POST /api/fees` — Create fee invoice with auto `amount_due` and `status` (Admin).
- `PUT /api/fees/:id` — Update fee record or record payment (Admin).

### 5. Exams
- `GET /api/exams` — List exams (Admin, Faculty, Student).
- `GET /api/exams/:id` — View specific exam (Admin, Faculty, Student).
- `POST /api/exams` — Schedule new exam (Admin, Faculty).
- `PUT /api/exams/:id` — Update exam schedule (Admin, Faculty).
- `DELETE /api/exams/:id` — Delete exam (Admin).

### 6. Results
- `GET /api/results/student/:studentId` — Student grade sheet (Admin, Faculty, or authorized Student).
- `GET /api/results/exam/:examId` — Exam-wide results (Admin, Faculty).
- `POST /api/results` — Record marks (0–100) with server-calculated grade (Admin, Faculty).
- `PUT /api/results/:id` — Update marks and recompute grade (Admin, Faculty).
- `DELETE /api/results/:id` — Delete result record (Admin).

### 7. Reports
- `GET /api/reports/student/:studentId/pdf` — Comprehensive student PDF report card.
- `GET /api/reports/attendance/pdf` — Attendance register PDF.
- `GET /api/reports/fees/pdf` — Fee audit & collection PDF report.
- `GET /api/reports/results/pdf` — Examination results sheet PDF.
- `GET /api/reports/students/excel` — Students roster `.xlsx` export.
- `GET /api/reports/attendance/excel` — Attendance register `.xlsx` export.
- `GET /api/reports/fees/excel` — Fee audit ledger `.xlsx` export.
- `GET /api/reports/results/excel` — Examination results `.xlsx` export.

---

## 💻 Sample API Requests

### 1. User Login (cURL)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@erp.com",
    "password": "Student@123"
  }'
```

### 2. Fetching Integrated Student Profile
```bash
curl -X GET http://localhost:5000/api/students/1/profile \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 3. Recording Attendance (Admin / Faculty)
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Authorization: Bearer <FACULTY_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "total_classes": 45,
    "classes_attended": 40
  }'
```

### 4. Entering Exam Marks (Admin / Faculty)
```bash
curl -X POST http://localhost:5000/api/results \
  -H "Authorization: Bearer <FACULTY_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "exam_id": 1,
    "marks": 92.5
  }'
```

---

## 🧪 Running Verification Tests

Run the built-in automated test suite to verify calculation logic, boundary conditions, PDF/Excel generation, and Express routing:

```bash
cd backend
node test-verify.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
