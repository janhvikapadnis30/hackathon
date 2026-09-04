# 🎓 College ERP — Frontend Application

A modern, responsive, role-based React single-page application built with **Vite**, **React Router v6**, **Axios**, and **Lucide Icons**, designed to interface with the local Node.js/Express ERP backend.

---

## 🚀 Features

- **🔐 Dual-Column Authentication Portal:**
  - Fast-fill demo credentials for Admin, Faculty, and Student.
  - Password visibility toggle, inline error handling, and session persistence via `AuthContext`.
- **🛡️ Role-Based Access Control (RBAC):**
  - Strict client-side route protection (`ProtectedRoute`) for `admin`, `faculty`, and `student`.
  - Automatic redirection based on institutional role.
- **👨‍💼 Admin Management Suite:**
  - **Dashboard:** Real-time KPI cards (total students, faculty, departments, fees).
  - **Student Management:** Roster table with multi-criteria search, department/semester filtering, Add Student modal, Edit Student modal, and Delete confirmation.
  - **Student Details Dossier:** Unified multi-module view displaying personal records, attendance progress, fee invoices, examination grades, and a one-click **Download Official PDF Report** button.
  - **Fee Management:** Financial ledger with collected vs. outstanding totals and payment collection modal.
  - **Attendance Register:** Course-by-course attendance inspection across departments.
  - **Results Ledger:** Master examination score sheets with backend-calculated letter grades.
  - **Reports & Export Center:** Instant triggers for downloading 4 official PDF reports (PDFKit) and 4 Excel workbooks (ExcelJS).
- **👩‍🏫 Faculty Portal:**
  - Class selector (Department → Semester → Course).
  - Attendance marking grid with backend-calculated percentages and compliance indicators (`Good`, `Warning`, `Critical`).
  - Marks entry ledger with automated backend letter grade evaluation (`A+` to `F`).
  - Enrolled student directory with profile inspection.
- **👨‍🎓 Student Portal (Read-Only):**
  - Personalized dashboard with attendance %, balance dues, and exam scores.
  - Interactive attendance compliance meter with low-attendance warnings (< 75%).
  - Detailed fee ledger with payment receipts and status tags (`PAID`, `PARTIAL`, `PENDING`).
  - Examination results and letter grades breakdown.
  - Official registration dossier with one-click PDF report download.

---

## 🛠 Tech Stack

- **Framework:** [React 18](https://react.dev/)
- **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Custom Enterprise CSS Design System (clean slate/indigo aesthetic)

---

## ⚙️ Environment Configuration

In the `frontend/` directory, configure `.env`:

```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The frontend application will start locally at **`http://localhost:5173`**.

### 3. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 🔑 Test Credentials

| Role | Email | Password | Landing Page |
|---|---|---|---|
| **Administrator** | `admin@erp.com` | `Admin@123` | `/admin/dashboard` |
| **Faculty** | `faculty@erp.com` | `Faculty@123` | `/faculty/dashboard` |
| **Student** | `student1@erp.com` | `Student@123` | `/student/dashboard` |

*(Additional faculty accounts: `faculty2@erp.com` to `faculty5@erp.com` with password `Faculty@123`)*  
*(Additional student accounts: `student2@erp.com` to `student50@erp.com` with password `Student@123`)*

---

## 🌐 Application Routes

### Public
- `/login` — Login portal

### Admin Routes (`allowedRoles=['admin']`)
- `/admin/dashboard` — Overview metrics & recent students
- `/admin/students` — Student directory with CRUD modals
- `/admin/students/:id` — Complete student dossier with PDF export
- `/admin/attendance` — Institutional attendance register
- `/admin/fees` — Institutional fee ledger & payment recording
- `/admin/results` — Exam results score sheet
- `/admin/reports` — PDF & Excel document export hub

### Faculty Routes (`allowedRoles=['faculty']`)
- `/faculty/dashboard` — Teaching metrics & shortcuts
- `/faculty/students` — Enrolled students directory
- `/faculty/attendance` — Class attendance entry grid
- `/faculty/results` — Exam marks entry ledger

### Student Routes (`allowedRoles=['student']`)
- `/student/dashboard` — Student homepage & summary cards
- `/student/profile` — Official registration record
- `/student/attendance` — Attendance breakdown & compliance meter
- `/student/fees` — Fee invoices & receipts
- `/student/results` — Examination grades & marks

---

## ❓ Troubleshooting

1. **Unable to Login / Network Error:**
   - Verify that the Express backend is running on `http://localhost:5000`.
   - Test `curl http://localhost:5000/api/health`.
2. **Session Expired:**
   - If a JWT token expires (default: 24h), the Axios interceptor will automatically clear `localStorage` and redirect you to `/login`.
3. **Database Seed Data Missing:**
   - In `backend/`, run `npm run seed` to regenerate the PostgreSQL mock records.
