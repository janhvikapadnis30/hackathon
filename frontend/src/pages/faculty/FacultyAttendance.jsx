import React, { useState, useEffect } from 'react';
import * as academicService from '../../services/academicService';
import * as studentService from '../../services/studentService';
import * as attendanceService from '../../services/attendanceService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getAttendanceBadge } from '../../utils/helpers';
import { CalendarCheck, Save, CheckCircle2 } from 'lucide-react';

export default function FacultyAttendance() {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Table rows
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Initial load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await academicService.getDepartments();
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
          setSelectedDeptId(res.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load academic departments.');
      }
    };
    fetchDepts();
  }, []);

  // When dept or semester changes, fetch courses
  useEffect(() => {
    if (!selectedDeptId || !selectedSemester) return;

    const fetchCourses = async () => {
      try {
        const res = await academicService.getCourses({
          department_id: selectedDeptId,
          semester: selectedSemester,
        });
        setCourses(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedCourseId(res.data[0].id.toString());
        } else {
          setSelectedCourseId('');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, [selectedDeptId, selectedSemester]);

  // When course selected, fetch students and existing attendance
  useEffect(() => {
    if (!selectedCourseId || !selectedDeptId || !selectedSemester) {
      setRecords([]);
      return;
    }

    const fetchClassStudentsAndAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        setSaveSuccess('');

        // 1. Fetch students enrolled in this dept & semester
        const studentsRes = await studentService.getStudents({
          department_id: selectedDeptId,
          semester: selectedSemester,
        });
        const enrolledStudents = studentsRes.data || [];

        // 2. Fetch existing attendance for this course
        const attendanceRes = await attendanceService.getAttendanceByCourse(selectedCourseId);
        const existingAtt = attendanceRes.data || [];

        // Combine
        const combined = enrolledStudents.map((st) => {
          const match = existingAtt.find((a) => a.student_id === st.id);
          return {
            student_id: st.id,
            roll_number: st.roll_number,
            name: st.name,
            attendance_id: match ? match.id : null,
            total_classes: match ? match.total_classes : 40,
            classes_attended: match ? match.classes_attended : 35,
            percentage: match ? match.percentage : null,
          };
        });

        setRecords(combined);
      } catch (err) {
        setError('Failed to load attendance records for selected class.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudentsAndAttendance();
  }, [selectedCourseId, selectedDeptId, selectedSemester]);

  // Change handlers for inputs
  const handleInputChange = (studentId, field, value) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, [field]: value } : item
      )
    );
  };

  // Save attendance for a student
  const handleSaveAttendance = async (row) => {
    const total = parseInt(row.total_classes, 10);
    const attended = parseInt(row.classes_attended, 10);

    if (isNaN(total) || isNaN(attended) || total < 0 || attended < 0) {
      alert('Total classes and attended sessions must be non-negative integers.');
      return;
    }

    if (attended > total) {
      alert('Classes attended cannot be greater than total classes.');
      return;
    }

    try {
      setSavingId(row.student_id);
      setError('');
      setSaveSuccess('');

      let response;
      if (row.attendance_id) {
        // Update existing
        response = await attendanceService.updateAttendance(row.attendance_id, {
          total_classes: total,
          classes_attended: attended,
        });
      } else {
        // Create new
        response = await attendanceService.createAttendance({
          student_id: row.student_id,
          course_id: parseInt(selectedCourseId, 10),
          total_classes: total,
          classes_attended: attended,
        });
      }

      // Update state with server-calculated percentage!
      const updatedRecord = response.data;
      setRecords((prev) =>
        prev.map((item) =>
          item.student_id === row.student_id
            ? {
                ...item,
                attendance_id: updatedRecord.id,
                total_classes: updatedRecord.total_classes,
                classes_attended: updatedRecord.classes_attended,
                percentage: updatedRecord.percentage,
              }
            : item
        )
      );

      setSaveSuccess(`Attendance updated for Roll No ${row.roll_number} (${updatedRecord.percentage}%).`);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Class Attendance Portal</h1>
          <p className="page-subtitle">Select your academic class and record student attendance sessions.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}
      {error && <ErrorMessage message={error} />}

      {/* Selectors Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Class Filter</h3>
        </div>
        <div className="form-grid p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="form-group">
            <label>Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="form-select"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="form-select"
            >
              {courses.length === 0 ? (
                <option value="">No courses configured</option>
              ) : (
                courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.course_code}] {c.course_name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Entry Grid */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Student Attendance Entry</h3>
            <p className="card-subtitle">
              Percentage is calculated securely on the server upon saving
            </p>
          </div>
          <span className="badge badge-info">{records.length} Students in Roster</span>
        </div>

        {loading ? (
          <Loading message="Loading class roster..." />
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-muted">
            No students found for the selected department and semester.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th style={{ width: '130px' }}>Total Classes</th>
                  <th style={{ width: '130px' }}>Attended</th>
                  <th>Backend Calculated %</th>
                  <th>Compliance Status</th>
                  <th style={{ textAlign: 'right' }}>Save</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const b = getAttendanceBadge(r.percentage);
                  return (
                    <tr key={r.student_id}>
                      <td className="font-semibold text-primary">{r.roll_number}</td>
                      <td>{r.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={r.total_classes}
                          onChange={(e) =>
                            handleInputChange(r.student_id, 'total_classes', e.target.value)
                          }
                          className="form-input-inline"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={r.total_classes}
                          value={r.classes_attended}
                          onChange={(e) =>
                            handleInputChange(r.student_id, 'classes_attended', e.target.value)
                          }
                          className="form-input-inline"
                        />
                      </td>
                      <td className="font-semibold">
                        {r.percentage !== null ? `${r.percentage}%` : 'Not saved'}
                      </td>
                      <td>
                        {r.percentage !== null ? (
                          <span className={`badge ${b.className}`}>{b.label}</span>
                        ) : (
                          <span className="badge badge-gray">Pending</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleSaveAttendance(r)}
                          className="btn btn-primary btn-sm"
                          disabled={savingId === r.student_id}
                        >
                          <Save size={14} />
                          {savingId === r.student_id ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
