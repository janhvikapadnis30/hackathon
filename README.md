# 🎓 College ERP — Integrated Student Management System

A production-grade, full-stack **College ERP System** designed for modern higher education institutions. This application integrates student registration, role-based access control, attendance tracking, fee management, examination grading, and automated PDF/Excel reporting.

---

## 🏛️ System Architecture

```
hackathon/
├── backend/                      # Node.js + Express + PostgreSQL REST API
│   ├── config/db.js              # PostgreSQL connection pool
│   ├── controllers/              # Business logic (auth, student, attendance, fee, exam, result, report)
│   ├── middleware/               # Auth (JWT), role-based access control (RBAC), error handling
│   ├── routes/                   # REST API routes
│   ├── database/                 # DDL schema (8 tables) & seed.js (50+ mock records)
│   ├── utils/gradeCalculator.js  # Server-side 10-point academic grading scale
│   ├── API_DOCUMENTATION.md      # Full REST API specification
│   ├── TESTING.md                # Verification test checklist
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server entrypoint (Port 5000)
│
├── frontend/                     # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, ProtectedRoute, StatCard, DataTable, Modal, Loading
│   │   ├── context/AuthContext   # Global auth state, session storage, login/logout
│   │   ├── services/             # Axios API services (auth, student, attendance, fee, exam, result, report)
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Dual-column login with fast-fill demo credentials
│   │   │   ├── admin/            # Admin portal (Dashboard, Students, StudentDetails, Fees, Attendance, Results, Reports)
│   │   │   ├── faculty/          # Faculty portal (Dashboard, Students, Attendance, Results)
│   │   │   └── student/          # Student portal (Dashboard, MyProfile, MyAttendance, MyFees, MyResults)
│   │   ├── utils/helpers.js      # Formatting & badge helpers
│   │   ├── App.jsx               # Role-based route definitions
│   │   └── index.css             # Enterprise ERP design system
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build configuration (Port 5173)
│
└── README.md                     # Root project guide
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Lucide React, Custom CSS |
| **Backend** | Node.js, Express.js, PostgreSQL (`pg`), JWT (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv |
| **Reporting** | PDFKit (server-side PDF generation), ExcelJS (server-side Excel spreadsheets) |
| **Database** | PostgreSQL (`student_erp`) with 8 normalized relational tables |

---

## ⚡ Quickstart Guide

### 1. Database Setup (PostgreSQL)
Ensure your local PostgreSQL server is running on port 5432, then create the database:
```sql
CREATE DATABASE student_erp;
```

### Unified Root Commands
From the project root directory, you can manage both services directly:

```bash
# Install dependencies for both backend and frontend
npm run install:all

# Seed database mock records (requires PostgreSQL running)
npm run seed

# Run verification test suite
npm run test:backend

# Start backend development server (Port 5000)
npm run server

# Start frontend development server (Port 5173)
npm run client

# Build frontend for production
npm run build:frontend
```
Open **`http://localhost:5173`** in your browser to access the ERP portal.

---

## 🔑 Demo Login Credentials

The database comes pre-seeded with fictional Indian student accounts, faculty, and administrators:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@erp.com` | `Admin@123` | Full control: student CRUD, fee management, attendance audit, results, and PDF/Excel reports. |
| **Faculty** | `faculty@erp.com` | `Faculty@123` | Student directory, attendance marking grid (auto %), and marks entry (auto grade). |
| **Student** | `student1@erp.com` | `Student@123` | Read-only access strictly limited to own profile, attendance, fees, results, and PDF report. |

*(Additional accounts: `faculty2@erp.com` to `faculty5@erp.com` / `student2@erp.com` to `student50@erp.com`)*

---

## 🛡️ Key Security & Business Logic

1. **Server-Side Calculations:**
   - **Attendance:** `percentage = (attended / total) * 100`. The server rejects inputs where `attended > total`.
   - **Fees:** `amount_due = total_fee - amount_paid`. Status (`PAID`, `PARTIAL`, `PENDING`) is determined on the server.
   - **Grading:** 10-point grading scale mapped in [`backend/utils/gradeCalculator.js`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/utils/gradeCalculator.js) (90-100 `A+`, 80-89 `A`, 70-79 `B+`, 60-69 `B`, 50-59 `C`, 40-49 `D`, <40 `F`).
2. **Anti-Spoofing ID Protection:**
   - When a student attempts to query `/api/attendance/student/:id`, `/api/fees/student/:id`, `/api/results/student/:id`, or `/api/reports/student/:id/pdf`, the server validates that `:id` matches the authenticated student's profile. Access to another student's record returns `403 Forbidden`.
3. **Automated Document Exports:**
   - **PDFKit**: Official Student Academic Report, Attendance Register, Fee Audit, and Exam Results Sheet.
   - **ExcelJS**: Student Roster, Attendance Ledger, Fee Audit with Totals, and Exam Marks Ledger.

---

## 📄 Documentation Links

- [`backend/API_DOCUMENTATION.md`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/API_DOCUMENTATION.md) — Comprehensive REST API documentation
- [`backend/TESTING.md`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/backend/TESTING.md) — Test checklist & verification scenarios
- [`frontend/README.md`](file:///c:/Users/Diksha%20Rathore/Documents/GitHub/hackathon/frontend/README.md) — Frontend architecture & usage guide

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
