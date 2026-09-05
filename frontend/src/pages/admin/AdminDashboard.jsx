import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Users, UserCheck, Landmark, CreditCard, ArrowRight, UserPlus, CalendarCheck, FileText } from 'lucide-react';
import * as studentService from '../../services/studentService';
import * as feeService from '../../services/feeService';
import * as academicService from '../../services/academicService';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [feeSummary, setFeeSummary] = useState({ total_records: 0, total_collected: 0, total_outstanding: 0 });
  const [deptCount, setDeptCount] = useState(5);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [studentsRes, feesRes, deptsRes] = await Promise.all([
        studentService.getStudents(),
        feeService.getAllFees(),
        academicService.getDepartments().catch(() => ({ data: [] })),
      ]);

      setStudents(studentsRes.data || []);
      if (feesRes.summary) {
        setFeeSummary(feesRes.summary);
      }
      if (deptsRes.data && deptsRes.data.length > 0) {
        setDeptCount(deptsRes.data.length);
      }
    } catch (err) {
      setError('Unable to load admin dashboard data. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading institutional metrics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  const recentStudents = students.slice(0, 6);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Institution Overview</h1>
          <p className="page-subtitle">Welcome back, Administrator. Real-time metrics from ERP database.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/admin/students')} className="btn btn-primary">
            <UserPlus size={16} /> Add / Manage Students
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled across all depts"
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Faculty Members"
          value="5"
          subtitle="Teaching departments"
          icon={UserCheck}
          color="indigo"
          onClick={() => alert('Faculty Management module is currently under development.')}
        />
        <StatCard
          title="Academic Departments"
          value={deptCount}
          subtitle="Engineering & Tech"
          icon={Landmark}
          color="emerald"
          onClick={() => alert('Academic Department configuration is currently under development.')}
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(feeSummary.total_outstanding)}
          subtitle={`Collected: ${formatCurrency(feeSummary.total_collected)}`}
          icon={CreditCard}
          color="amber"
          onClick={() => navigate('/admin/fees')}
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Quick ERP Actions</h3>
        </div>
        <div className="quick-actions-grid">
          <button onClick={() => navigate('/admin/students')} className="quick-action-btn">
            <UserPlus className="quick-action-icon text-blue" size={22} />
            <div className="quick-action-text">
              <h4>Student Directory</h4>
              <p>Register, edit, or delete student profiles</p>
            </div>
          </button>
          <button onClick={() => navigate('/admin/attendance')} className="quick-action-btn">
            <CalendarCheck className="quick-action-icon text-indigo" size={22} />
            <div className="quick-action-text">
              <h4>Attendance Register</h4>
              <p>Audit course attendance across semesters</p>
            </div>
          </button>
          <button onClick={() => navigate('/admin/fees')} className="quick-action-btn">
            <CreditCard className="quick-action-icon text-amber" size={22} />
            <div className="quick-action-text">
              <h4>Fee Ledger & Invoices</h4>
              <p>Record fee collections and monitor dues</p>
            </div>
          </button>
          <button onClick={() => navigate('/admin/reports')} className="quick-action-btn">
            <FileText className="quick-action-icon text-emerald" size={22} />
            <div className="quick-action-text">
              <h4>Generate Reports</h4>
              <p>Export official PDF & Excel sheets</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Students Table Section */}
      <div className="card mt-6">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Recently Enrolled Students</h3>
            <p className="card-subtitle">Active student records registered in the system</p>
          </div>
          <button onClick={() => navigate('/admin/students')} className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Admission Year</th>
                <th>Attendance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold text-primary">{s.roll_number}</td>
                  <td>{s.name}</td>
                  <td>
                    <span className="badge badge-info">{s.department_code || 'DEPT'}</span>
                  </td>
                  <td>Semester {s.semester}</td>
                  <td>{s.admission_year}</td>
                  <td>
                    {s.attendance_pct ? (
                      <span className={`badge ${s.attendance_pct >= 75 ? 'badge-success' : 'badge-warning'}`}>
                        {s.attendance_pct}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="btn btn-outline btn-sm"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
