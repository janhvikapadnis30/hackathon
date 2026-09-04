import React, { useState, useEffect } from 'react';
import * as examService from '../../services/examService';
import * as academicService from '../../services/academicService';
import * as studentService from '../../services/studentService';
import * as resultService from '../../services/resultService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getGradeBadge } from '../../utils/helpers';
import { GraduationCap, Save, CheckCircle2 } from 'lucide-react';

export default function FacultyResults() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Table rows
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load Exams & Departments initially
  useEffect(() => {
    const initData = async () => {
      try {
        const [examsRes, deptsRes] = await Promise.all([
          examService.getAllExams(),
          academicService.getDepartments(),
        ]);

        if (examsRes.data && examsRes.data.length > 0) {
          setExams(examsRes.data);
          setSelectedExamId(examsRes.data[0].id.toString());
        }

        if (deptsRes.data && deptsRes.data.length > 0) {
          setDepartments(deptsRes.data);
          setSelectedDeptId(deptsRes.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to initialize exam and department lists.');
      }
    };

    initData();
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

  // When exam, course, dept, and semester are selected, fetch enrolled students and existing marks
  useEffect(() => {
    if (!selectedExamId || !selectedCourseId || !selectedDeptId || !selectedSemester) {
      setRows([]);
      return;
    }

    const fetchStudentsAndMarks = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMsg('');

        // 1. Fetch students enrolled
        const studentsRes = await studentService.getStudents({
          department_id: selectedDeptId,
          semester: selectedSemester,
        });
        const enrolled = studentsRes.data || [];

        // 2. Fetch results for this exam
        const resultsRes = await resultService.getResultsByExam(selectedExamId);
        const existingResults = (resultsRes.data || []).filter(
          (r) => r.course_id === parseInt(selectedCourseId, 10)
        );

        // Combine
        const merged = enrolled.map((st) => {
          const match = existingResults.find((r) => r.student_id === st.id);
          return {
            student_id: st.id,
            roll_number: st.roll_number,
            name: st.name,
            result_id: match ? match.id : null,
            marks: match ? match.marks : '',
            grade: match ? match.grade : null,
          };
        });

        setRows(merged);
      } catch (err) {
        setError('Failed to load students for marks entry.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndMarks();
  }, [selectedExamId, selectedCourseId, selectedDeptId, selectedSemester]);

  const handleMarksChange = (studentId, value) => {
    setRows((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, marks: value } : r))
    );
  };

  const handleSaveMarks = async (row) => {
    const numMarks = parseFloat(row.marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 100) {
      alert('Marks must be a valid number between 0 and 100.');
      return;
    }

    try {
      setSavingId(row.student_id);
      setError('');
      setSuccessMsg('');

      let response;
      if (row.result_id) {
        // Update
        response = await resultService.updateResult(row.result_id, { marks: numMarks });
      } else {
        // Create
        response = await resultService.createResult({
          student_id: row.student_id,
          course_id: parseInt(selectedCourseId, 10),
          exam_id: parseInt(selectedExamId, 10),
          marks: numMarks,
        });
      }

      const updated = response.data;
      setRows((prev) =>
        prev.map((r) =>
          r.student_id === row.student_id
            ? {
                ...r,
                result_id: updated.id,
                marks: updated.marks,
                grade: updated.grade, // Computed by backend!
              }
            : r
        )
      );

      setSuccessMsg(`Marks saved for Roll No ${row.roll_number}. Awarded Grade: ${updated.grade}.`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save examination marks.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enter Examination Results</h1>
          <p className="page-subtitle">Input student exam marks. Letter grades are automatically evaluated by the server.</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && <ErrorMessage message={error} />}

      {/* Selectors Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Examination & Subject Filters</h3>
        </div>
        <div
          className="form-grid p-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          <div className="form-group">
            <label>Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="form-select"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} (Sem {ex.semester})
                </option>
              ))}
            </select>
          </div>

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

      {/* Marks Entry Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Marks Entry Ledger</h3>
            <p className="card-subtitle">Letter grades are computed dynamically on backend</p>
          </div>
          <span className="badge badge-info">{rows.length} Students</span>
        </div>

        {loading ? (
          <Loading message="Loading student marks ledger..." />
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted">
            No students found for this class combination.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th style={{ width: '150px' }}>Marks (0–100)</th>
                  <th>Server Grade</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const b = getGradeBadge(r.grade);
                  return (
                    <tr key={r.student_id}>
                      <td className="font-semibold text-primary">{r.roll_number}</td>
                      <td>{r.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          placeholder="e.g. 85"
                          value={r.marks}
                          onChange={(e) => handleMarksChange(r.student_id, e.target.value)}
                          className="form-input-inline"
                        />
                      </td>
                      <td>
                        {r.grade ? (
                          <span className={`badge ${b.className}`}>{r.grade}</span>
                        ) : (
                          <span className="badge badge-gray">Not entered</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleSaveMarks(r)}
                          className="btn btn-primary btn-sm"
                          disabled={savingId === r.student_id || r.marks === ''}
                        >
                          <Save size={14} />
                          {savingId === r.student_id ? 'Saving...' : 'Save Result'}
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
