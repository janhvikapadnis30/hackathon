import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as attendanceService from '../../services/attendanceService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getAttendanceBadge } from '../../utils/helpers';
import { CalendarCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MyAttendance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.student_id) {
      setError('Student identity not detected.');
      setLoading(false);
      return;
    }

    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await attendanceService.getAttendanceByStudent(user.student_id);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance.');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [user]);

  if (loading) return <Loading message="Loading attendance records..." />;
  if (error) return <ErrorMessage message={error} />;

  const overall = data?.summary?.overall_percentage || 0;
  const isLow = overall < 75;
  const badge = getAttendanceBadge(overall);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance Record</h1>
          <p className="page-subtitle">Track your lecture participation and mandatory attendance threshold.</p>
        </div>
      </div>

      {isLow ? (
        <div className="alert alert-warning flex items-center gap-3 mb-6">
          <AlertTriangle size={24} />
          <div>
            <strong>Low Attendance Warning:</strong> Your overall attendance is {overall}%, which is
            below the institutional mandatory requirement of 75%. You may risk debarment from semester
            examinations if this is not rectified.
          </div>
        </div>
      ) : (
        <div className="alert alert-success flex items-center gap-3 mb-6">
          <CheckCircle2 size={24} />
          <div>
            <strong>Good Standing:</strong> Your current attendance is {overall}%, meeting all institutional requirements.
          </div>
        </div>
      )}

      {/* Attendance Progress Meter Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Overall Compliance Meter</h3>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold" style={{ fontSize: '16px' }}>
              Attendance Progress ({data?.summary?.classes_attended} / {data?.summary?.total_classes} Classes)
            </span>
            <span className={`badge ${badge.className}`} style={{ fontSize: '14px', padding: '4px 10px' }}>
              {overall}% — {badge.label}
            </span>
          </div>

          <div className="progress-track">
            <div
              className={`progress-fill ${isLow ? 'progress-fill-warning' : 'progress-fill-success'}`}
              style={{ width: `${Math.min(100, Math.max(0, overall))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Course-By-Course Breakdown</h3>
          <p className="card-subtitle">Server-calculated attendance percentages per subject</p>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Total Classes</th>
                <th>Attended</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    No attendance records logged for your courses.
                  </td>
                </tr>
              ) : (
                data.data.map((item) => {
                  const b = getAttendanceBadge(item.percentage);
                  return (
                    <tr key={item.id}>
                      <td className="font-semibold text-primary">{item.course_code}</td>
                      <td>{item.course_name}</td>
                      <td>{item.total_classes}</td>
                      <td>{item.classes_attended}</td>
                      <td className="font-semibold">{item.percentage}%</td>
                      <td>
                        <span className={`badge ${b.className}`}>{b.label}</span>
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
