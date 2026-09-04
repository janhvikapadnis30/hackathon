import React, { useState, useEffect } from 'react';
import * as academicService from '../../services/academicService';
import * as attendanceService from '../../services/attendanceService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getAttendanceBadge } from '../../utils/helpers';
import { CalendarCheck, BookOpen, Filter } from 'lucide-react';

export default function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await academicService.getCourses();
        if (res.data && res.data.length > 0) {
          setCourses(res.data);
          setSelectedCourseId(res.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load courses.');
      }
    };
    fetchCourses();
  }, []);

  // Fetch attendance when course selected
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchCourseAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await attendanceService.getAttendanceByCourse(selectedCourseId);
        setAttendanceRecords(res.data || []);
        setCourseInfo(res.course || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course attendance register.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAttendance();
  }, [selectedCourseId]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Register</h1>
          <p className="page-subtitle">Track and audit classroom attendance across departmental subjects.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Course Selection Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Select Course to Inspect
          </h3>
        </div>
        <div className="p-4">
          <div className="form-group" style={{ maxWidth: '450px', marginBottom: 0 }}>
            <label>Academic Subject</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="form-select"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.course_code}] {c.course_name} (Sem {c.semester} • {c.department_code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">
              Enrolled Students Attendance {courseInfo ? `— ${courseInfo.course_code}` : ''}
            </h3>
            <p className="card-subtitle">
              Calculated automatically by the server based on attended sessions
            </p>
          </div>
          <span className="badge badge-info">{attendanceRecords.length} Students Logged</span>
        </div>

        {loading ? (
          <Loading message="Loading attendance register..." />
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Total Classes</th>
                  <th>Classes Attended</th>
                  <th>Attendance %</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-cell">
                      No attendance records found for this course.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((att) => {
                    const b = getAttendanceBadge(att.percentage);
                    return (
                      <tr key={att.id}>
                        <td className="font-semibold text-primary">{att.roll_number}</td>
                        <td>{att.student_name}</td>
                        <td>{att.total_classes}</td>
                        <td>{att.classes_attended}</td>
                        <td className="font-semibold">{att.percentage}%</td>
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
        )}
      </div>
    </div>
  );
}
