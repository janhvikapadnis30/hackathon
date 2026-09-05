import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Page
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Students from './pages/admin/Students';
import StudentDetails from './pages/admin/StudentDetails';
import Attendance from './pages/admin/Attendance';
import Fees from './pages/admin/Fees';
import Results from './pages/admin/Results';
import Reports from './pages/admin/Reports';
import AdminFaculty from './pages/admin/AdminFaculty';
import AdminDepartments from './pages/admin/AdminDepartments';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyResults from './pages/faculty/FacultyResults';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyProfile from './pages/student/MyProfile';
import MyAttendance from './pages/student/MyAttendance';
import MyFees from './pages/student/MyFees';
import MyResults from './pages/student/MyResults';

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root redirection */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/students/:id" element={<StudentDetails />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="/admin/fees" element={<Fees />} />
        <Route path="/admin/results" element={<Results />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/faculty" element={<AdminFaculty />} />
        <Route path="/admin/departments" element={<AdminDepartments />} />
      </Route>

      {/* Faculty Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/students" element={<FacultyStudents />} />
        <Route path="/faculty/attendance" element={<FacultyAttendance />} />
        <Route path="/faculty/results" element={<FacultyResults />} />
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<MyProfile />} />
        <Route path="/student/attendance" element={<MyAttendance />} />
        <Route path="/student/fees" element={<MyFees />} />
        <Route path="/student/results" element={<MyResults />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
