import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';
import * as reportService from '../../services/reportService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatCurrency,
  formatDate,
  getAttendanceBadge,
  getFeeBadge,
  getGradeBadge,
} from '../../utils/helpers';
import {
  ArrowLeft,
  Download,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentService.getStudentProfile(id);
      setProfileData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      await reportService.downloadStudentPDF(id, profileData?.personal_info?.roll_number);
    } catch (err) {
      alert('Failed to generate student PDF report. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) return <Loading message="Loading student academic dossier..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProfile} />;
  if (!profileData) return <ErrorMessage message="Student profile not found." />;

  const { personal_info, attendance, fees, results } = profileData;
  const attBadge = getAttendanceBadge(attendance?.overall_percentage);

  return (
    <div className="page-container">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleDownloadPDF}
          className="btn btn-primary"
          disabled={downloadingPDF}
        >
          <Download size={16} />
          {downloadingPDF ? 'Generating Official PDF...' : 'Download Official PDF Report'}
        </button>
      </div>

      {/* Main Student Info Header Card */}
      <div className="card student-dossier-header-card mb-6">
        <div className="dossier-hero">
          <div className="dossier-avatar">
            {personal_info.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="dossier-headline">
            <div className="flex items-center gap-3">
              <h1 className="dossier-name">{personal_info.name}</h1>
              <span className="badge badge-primary">{personal_info.roll_number}</span>
            </div>
            <p className="dossier-subtext">
              {personal_info.department_name} ({personal_info.department_code}) • Semester{' '}
              {personal_info.semester} • Batch of {personal_info.admission_year}
            </p>
          </div>
        </div>

        <div className="dossier-meta-grid">
          <div className="meta-item">
            <Mail size={16} className="meta-icon" />
            <span>{personal_info.email}</span>
          </div>
          <div className="meta-item">
            <Phone size={16} className="meta-icon" />
            <span>{personal_info.phone || 'No phone provided'}</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} className="meta-icon" />
            <span>DOB: {formatDate(personal_info.date_of_birth)}</span>
          </div>
          <div className="meta-item">
            <MapPin size={16} className="meta-icon" />
            <span>{personal_info.address || 'Address not listed'}</span>
          </div>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="stats-grid mb-6">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Overall Attendance</p>
              <h3 className="stat-card-value">{attendance?.overall_percentage || 0}%</h3>
              <p className="stat-card-subtitle">
                {attendance?.attended_classes || 0} / {attendance?.total_classes || 0} classes
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
              <p className="stat-card-title">Courses Evaluated</p>
              <h3 className="stat-card-value">{results?.length || 0}</h3>
              <p className="stat-card-subtitle">Exam subjects graded</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-emerald">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Attendance Records */}
      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Course-Wise Attendance</h3>
            <p className="card-subtitle">Recorded class participation calculated by the server</p>
          </div>
          <span className={`badge ${attBadge.className}`}>
            Status: {attBadge.label}
          </span>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Total Classes</th>
                <th>Classes Attended</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!attendance?.records || attendance.records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    No attendance records for this student yet.
                  </td>
                </tr>
              ) : (
                attendance.records.map((att) => {
                  const b = getAttendanceBadge(att.percentage);
                  return (
                    <tr key={att.id}>
                      <td className="font-semibold text-primary">{att.course_code}</td>
                      <td>{att.course_name}</td>
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
      </div>

      {/* Section 2: Fee Ledger */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Fee Ledger & Payment Invoices</h3>
          <p className="card-subtitle">Semester billing, payment amounts, and balance due</p>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Total Fee</th>
                <th>Amount Paid</th>
                <th>Amount Due</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!fees?.records || fees.records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    No fee invoices recorded.
                  </td>
                </tr>
              ) : (
                fees.records.map((fee) => {
                  const b = getFeeBadge(fee.status);
                  return (
                    <tr key={fee.id}>
                      <td className="font-semibold">Semester {fee.semester}</td>
                      <td>{formatCurrency(fee.total_fee)}</td>
                      <td>{formatCurrency(fee.amount_paid)}</td>
                      <td className="font-semibold text-danger">{formatCurrency(fee.amount_due)}</td>
                      <td>{formatDate(fee.due_date)}</td>
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

      {/* Section 3: Examination Results */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Examination Results & Grades</h3>
          <p className="card-subtitle">Marks scored and backend-calculated letter grades</p>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Marks Scored</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {!results || results.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    No examination results recorded for this student.
                  </td>
                </tr>
              ) : (
                results.map((res) => {
                  const b = getGradeBadge(res.grade);
                  return (
                    <tr key={res.id}>
                      <td className="font-semibold">{res.exam_name}</td>
                      <td className="text-primary font-semibold">{res.course_code}</td>
                      <td>{res.course_name}</td>
                      <td>{res.credits}</td>
                      <td className="font-semibold">{res.marks} / 100</td>
                      <td>
                        <span className={`badge ${b.className}`}>{res.grade}</span>
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
