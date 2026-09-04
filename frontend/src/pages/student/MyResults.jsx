import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as resultService from '../../services/resultService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getGradeBadge } from '../../utils/helpers';
import { GraduationCap, Award, BookOpen } from 'lucide-react';

export default function MyResults() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [selectedExamName, setSelectedExamName] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.student_id) {
      setError('Student identity could not be verified.');
      setLoading(false);
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await resultService.getResultsByStudent(user.student_id);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve your exam results.');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user]);

  if (loading) return <Loading message="Loading examination results..." />;
  if (error) return <ErrorMessage message={error} />;

  const records = data?.data || [];
  const examNames = ['ALL', ...new Set(records.map((r) => r.exam_name))];

  const filteredRecords =
    selectedExamName === 'ALL'
      ? records
      : records.filter((r) => r.exam_name === selectedExamName);

  const averageScore =
    filteredRecords.length > 0
      ? (
          filteredRecords.reduce((sum, r) => sum + parseFloat(r.marks), 0) /
          filteredRecords.length
        ).toFixed(2)
      : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Examination Results</h1>
          <p className="page-subtitle">Inspect your subject scores, earned credits, and letter grades.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Average Marks</p>
              <h3 className="stat-card-value">{averageScore} / 100</h3>
              <p className="stat-card-subtitle">Calculated across selected exams</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-blue">
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Evaluated Subjects</p>
              <h3 className="stat-card-value">{filteredRecords.length}</h3>
              <p className="stat-card-subtitle">Courses graded</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-emerald">
              <BookOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Exam Filter Tabs / Dropdown */}
      <div className="card filter-bar-card mb-6">
        <div className="flex items-center gap-3 p-2">
          <GraduationCap size={20} className="text-primary" />
          <span className="font-semibold">Filter by Exam Cycle:</span>
          <select
            value={selectedExamName}
            onChange={(e) => setSelectedExamName(e.target.value)}
            className="form-select"
            style={{ maxWidth: '320px' }}
          >
            {examNames.map((name) => (
              <option key={name} value={name}>
                {name === 'ALL' ? 'All Examination Cycles' : name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Grade Sheet</h3>
          <p className="card-subtitle">Official academic evaluation records</p>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Examination</th>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Marks Scored</th>
                <th>Letter Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    No results found for the selected examination.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const b = getGradeBadge(r.grade);
                  return (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.exam_name}</td>
                      <td className="text-primary font-semibold">{r.course_code}</td>
                      <td>{r.course_name}</td>
                      <td>{r.credits}</td>
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
