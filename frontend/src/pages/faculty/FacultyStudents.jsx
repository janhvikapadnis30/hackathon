import React, { useState, useEffect } from 'react';
import * as studentService from '../../services/studentService';
import * as academicService from '../../services/academicService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import { Search, Eye } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Student Profile Preview Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedDept) params.department_id = selectedDept;
      if (selectedSemester) params.semester = selectedSemester;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [studRes, deptRes] = await Promise.all([
        studentService.getStudents(params),
        departments.length === 0 ? academicService.getDepartments() : Promise.resolve({ data: departments }),
      ]);

      setStudents(studRes.data || []);
      if (deptRes.data) setDepartments(deptRes.data);
    } catch (err) {
      setError('Failed to load students roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedDept, selectedSemester]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    try {
      setProfileLoading(true);
      const res = await studentService.getStudentProfile(student.id);
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Student Directory</h1>
          <p className="page-subtitle">Inspect enrolled students across academic departments and semesters.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadStudents} />}

      {/* Filter and Search */}
      <div className="card filter-bar-card mb-6">
        <form onSubmit={handleSearch} className="filter-bar-form">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </div>

          <div className="filters-right">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-select"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Students Table */}
      <div className="card">
        {loading ? (
          <Loading message="Fetching student records..." />
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty-cell">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td className="font-semibold text-primary">{s.roll_number}</td>
                      <td>{s.name}</td>
                      <td>
                        <span className="badge badge-info">{s.department_code}</span>
                      </td>
                      <td>Semester {s.semester}</td>
                      <td className="text-muted">{s.email}</td>
                      <td>{s.phone || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleViewStudent(s)}
                          className="btn btn-outline btn-sm"
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Student Dossier: ${selectedStudent?.name} (${selectedStudent?.roll_number})`}
        maxWidth="600px"
      >
        {profileLoading ? (
          <Loading message="Loading profile..." />
        ) : profileData ? (
          <div>
            <div className="form-grid mb-4">
              <div>
                <strong>Roll Number:</strong> {profileData.personal_info.roll_number}
              </div>
              <div>
                <strong>Department:</strong> {profileData.personal_info.department_name}
              </div>
              <div>
                <strong>Semester:</strong> Semester {profileData.personal_info.semester}
              </div>
              <div>
                <strong>Admission Year:</strong> {profileData.personal_info.admission_year}
              </div>
              <div>
                <strong>Email:</strong> {profileData.personal_info.email}
              </div>
              <div>
                <strong>Phone:</strong> {profileData.personal_info.phone || 'N/A'}
              </div>
              <div>
                <strong>Date of Birth:</strong> {formatDate(profileData.personal_info.date_of_birth)}
              </div>
              <div>
                <strong>Address:</strong> {profileData.personal_info.address || 'N/A'}
              </div>
            </div>

            <h4 style={{ margin: '16px 0 8px 0', fontSize: '15px', fontWeight: 600 }}>
              Attendance Summary
            </h4>
            <p>
              Overall Attendance:{' '}
              <strong className="text-primary">
                {profileData.attendance?.overall_percentage}%
              </strong>{' '}
              ({profileData.attendance?.attended_classes} / {profileData.attendance?.total_classes} classes)
            </p>

            <div className="modal-actions mt-6">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
