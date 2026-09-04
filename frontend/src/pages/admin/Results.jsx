import React, { useState, useEffect } from 'react';
import * as examService from '../../services/examService';
import * as resultService from '../../services/resultService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getGradeBadge, formatDate } from '../../utils/helpers';
import { GraduationCap, BookOpen, Calendar } from 'lucide-react';

export default function Results() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState([]);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examService.getAllExams();
        if (res.data && res.data.length > 0) {
          setExams(res.data);
          setSelectedExamId(res.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load examinations list.');
      }
    };
    fetchExams();
  }, []);

  // Fetch results when exam selected
  useEffect(() => {
    if (!selectedExamId) return;

    const fetchExamResults = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await resultService.getResultsByExam(selectedExamId);
        setResults(res.data || []);
        setExamInfo(res.exam || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load examination results.');
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, [selectedExamId]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Examination Results</h1>
          <p className="page-subtitle">View student scores and backend-calculated letter grades by examination.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Exam Selector */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" /> Select Examination Cycle
          </h3>
        </div>
        <div className="p-4">
          <div className="form-group" style={{ maxWidth: '450px', marginBottom: 0 }}>
            <label>Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="form-select"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} (Semester {ex.semester} • Date: {formatDate(ex.exam_date)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">
              Score Ledger {examInfo ? `— ${examInfo.name}` : ''}
            </h3>
            <p className="card-subtitle">Letter grades computed automatically using academic grading scale</p>
          </div>
          <span className="badge badge-info">{results.length} Grade Records</span>
        </div>

        {loading ? (
          <Loading message="Fetching examination grade records..." />
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Dept</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Marks Scored</th>
                  <th>Grade Awarded</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty-cell">
                      No results published for this examination cycle yet.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => {
                    const b = getGradeBadge(r.grade);
                    return (
                      <tr key={r.id}>
                        <td className="font-semibold text-primary">{r.roll_number}</td>
                        <td>{r.student_name}</td>
                        <td>{r.department_code}</td>
                        <td className="font-semibold">{r.course_code}</td>
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
        )}
      </div>
    </div>
  );
}
