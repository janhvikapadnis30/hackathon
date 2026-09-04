import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as studentService from '../../services/studentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatCurrency,
  getAttendanceBadge,
  getFeeBadge,
  getGradeBadge,
} from '../../utils/helpers';
import {
  CalendarCheck,
  CreditCard,
  GraduationCap,
  UserCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.student_id) {
      setError('Student identity could not be verified.');
      setLoading(false);
      return;
    }

    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await studentService.getStudentProfile(user.student_id);
        setProfileData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve your academic profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  if (loading) return <Loading message="Loading student portal..." />;
  if (error) return <ErrorMessage message={error} />;

  const { personal_info, attendance, fees, results } = profileData || {};
  const isAttendanceLow = attendance?.overall_percentage < 75;

  return (
    <div className="page-container">
      {/* Student Welcome Banner */}
      <div className="card student-welcome-banner mb-6">
        <div className="welcome-headline">
          <h2>Welcome back, {personal_info?.name}!</h2>
          <p className="welcome-subtext">
            Roll No: <strong>{personal_info?.roll_number}</strong> • Department:{' '}
            <strong>{personal_info?.department_name}</strong> • Semester {personal_info?.semester}
          </p>
        </div>
      </div>

      {isAttendanceLow && (
        <div className="alert alert-warning flex items-center gap-2 mb-6">
          <AlertTriangle size={20} />
          <span>
            <strong>Attendance Notice:</strong> Your overall attendance is currently at{' '}
            {attendance?.overall_percentage}%, which is below the mandatory 75% institutional requirement.
          </span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid mb-6">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Overall Attendance</p>
              <h3 className="stat-card-value">{attendance?.overall_percentage || 0}%</h3>
              <p className="stat-card-subtitle">
                {attendance?.attended_classes || 0} / {attendance?.total_classes || 0} sessions
              </p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-blue">
              <CalendarCheck size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Fee Balance Due</p>
              <h3 className="stat-card-value">{formatCurrency(fees?.total_due)}</h3>
              <p className="stat-card-subtitle">Paid: {formatCurrency(fees?.total_paid)}</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-amber">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Completed Exams</p>
              <h3 className="stat-card-value">{results?.length || 0}</h3>
              <p className="stat-card-subtitle">Subjects evaluated</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-emerald">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Student Portal Shortcuts</h3>
        </div>
        <div className="quick-actions-grid">
          <button onClick={() => navigate('/student/attendance')} className="quick-action-btn">
            <CalendarCheck className="quick-action-icon text-blue" size={24} />
            <div className="quick-action-text">
              <h4>My Attendance</h4>
              <p>Subject-wise breakdown & percentage meter</p>
            </div>
          </button>
          <button onClick={() => navigate('/student/fees')} className="quick-action-btn">
            <CreditCard className="quick-action-icon text-amber" size={24} />
            <div className="quick-action-text">
              <h4>My Fee Invoices</h4>
              <p>Tuition fees, receipts, and balance dues</p>
            </div>
          </button>
          <button onClick={() => navigate('/student/results')} className="quick-action-btn">
            <GraduationCap className="quick-action-icon text-emerald" size={24} />
            <div className="quick-action-text">
              <h4>My Examination Results</h4>
              <p>Grades awarded across examination cycles</p>
            </div>
          </button>
          <button onClick={() => navigate('/student/profile')} className="quick-action-btn">
            <UserCheck className="quick-action-icon text-indigo" size={24} />
            <div className="quick-action-text">
              <h4>My Profile</h4>
              <p>View your official enrollment record</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Examination Results Snapshot */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Latest Academic Performance</h3>
            <p className="card-subtitle">Official scores and letter grades</p>
          </div>
          <button onClick={() => navigate('/student/results')} className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Exam Cycle</th>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {!results || results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-cell">
                    No results have been recorded for your account yet.
                  </td>
                </tr>
              ) : (
                results.slice(0, 5).map((r) => {
                  const b = getGradeBadge(r.grade);
                  return (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.exam_name}</td>
                      <td className="text-primary font-semibold">{r.course_code}</td>
                      <td>{r.course_name}</td>
                      <td className="font-semibold">{r.marks} / 100</td>
                      <td>
                        <span className={`badge ${b.className}`}>{r.grade}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
