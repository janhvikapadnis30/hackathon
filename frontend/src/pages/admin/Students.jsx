import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';
import * as academicService from '../../services/academicService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import { Search, Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roll_number: '',
    department_id: '',
    semester: '1',
    phone: '',
    date_of_birth: '',
    address: '',
    admission_year: new Date().getFullYear().toString(),
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedDept) params.department_id = selectedDept;
      if (selectedSemester) params.semester = selectedSemester;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [studentsRes, deptsRes] = await Promise.all([
        studentService.getStudents(params),
        departments.length === 0 ? academicService.getDepartments() : Promise.resolve({ data: departments }),
      ]);

      setStudents(studentsRes.data || []);
      if (deptsRes.data) setDepartments(deptsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedSemester]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      roll_number: '',
      department_id: departments[0]?.id || '',
      semester: '1',
      phone: '',
      date_of_birth: '',
      address: '',
      admission_year: new Date().getFullYear().toString(),
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: '',
      roll_number: student.roll_number || '',
      department_id: student.department_id || '',
      semester: student.semester?.toString() || '1',
      phone: student.phone || '',
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
      address: student.address || '',
      admission_year: student.admission_year?.toString() || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Submit Add Student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.roll_number || !formData.department_id) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setFormSubmitting(true);
      await studentService.createStudent(formData);
      setIsAddModalOpen(false);
      setActionSuccess('Student registered successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      setFormSubmitting(true);
      await studentService.updateStudent(currentStudent.id, formData);
      setIsEditModalOpen(false);
      setActionSuccess('Student profile updated successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update student profile.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Delete Student
  const handleDeleteConfirm = async () => {
    try {
      setFormSubmitting(true);
      await studentService.deleteStudent(currentStudent.id);
      setIsDeleteModalOpen(false);
      setActionSuccess(`Student ${currentStudent.name} deleted.`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
          <p className="page-subtitle">Manage student enrollment, profiles, and academic records.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Register New Student
        </button>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* Filter and Search Bar */}
      <div className="card filter-bar-card">
        <form onSubmit={handleSearchSubmit} className="filter-bar-form">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, roll number..."
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
      <div className="card mt-6">
        {loading ? (
          <Loading message="Fetching student roster..." />
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Phone</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty-cell">
                      No students match the selected filters.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td className="font-semibold text-primary">{s.roll_number}</td>
                      <td>{s.name}</td>
                      <td className="text-muted">{s.email}</td>
                      <td>
                        <span className="badge badge-info">{s.department_code || 'DEPT'}</span>
                      </td>
                      <td>Sem {s.semester}</td>
                      <td>{s.phone || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          <button
                            onClick={() => navigate(`/admin/students/${s.id}`)}
                            className="action-btn action-view"
                            title="View Complete Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="action-btn action-edit"
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(s)}
                            className="action-btn action-delete"
                            title="Delete Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student"
        maxWidth="650px"
      >
        {formError && <div className="alert alert-danger">{formError}</div>}
        <form onSubmit={handleAddSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Kavya Patel"
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. kavya@erp.com"
              />
            </div>
            <div className="form-group">
              <label>Roll Number *</label>
              <input
                type="text"
                required
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                placeholder="e.g. CSE2024055"
              />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank for Student@123"
              />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Semester *</label>
              <select
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label>Admission Year *</label>
              <input
                type="number"
                required
                value={formData.admission_year}
                onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="form-group form-col-full">
              <label>Residential Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full residential address"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student: ${currentStudent?.roll_number}`}
        maxWidth="650px"
      >
        {formError && <div className="alert alert-danger">{formError}</div>}
        <form onSubmit={handleEditSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
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
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Admission Year</label>
              <input
                type="number"
                value={formData.admission_year}
                onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
              />
            </div>
            <div className="form-group form-col-full">
              <label>Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="450px"
      >
        <p style={{ marginBottom: '20px', color: '#4b5563', lineHeight: 1.5 }}>
          Are you sure you want to delete student <strong>{currentStudent?.name}</strong> (Roll No:{' '}
          <strong>{currentStudent?.roll_number}</strong>)? This action will permanently remove their user
          account, attendance, fee, and result records.
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteConfirm}
            disabled={formSubmitting}
          >
            {formSubmitting ? 'Deleting...' : 'Yes, Delete Record'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
