import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as studentService from '../../services/studentService';
import * as reportService from '../../services/reportService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/helpers';
import { User, Mail, Phone, Calendar, MapPin, Download, BookOpen, Shield } from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    if (!user?.student_id) {
      setError('Student identity not detected.');
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await studentService.getStudent(user.student_id);
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile record.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      await reportService.downloadStudentPDF(user.student_id, profile?.roll_number);
    } catch (err) {
      alert('Failed to generate your PDF report card.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) return <Loading message="Loading profile..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Academic Profile</h1>
          <p className="page-subtitle">Official institutional registration dossier and enrollment records.</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="btn btn-primary"
          disabled={downloadingPDF}
        >
          <Download size={16} />
          {downloadingPDF ? 'Downloading...' : 'Download My PDF Report'}
        </button>
      </div>

      <div className="card student-dossier-header-card mb-6">
        <div className="dossier-hero">
          <div className="dossier-avatar">
            {profile?.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="dossier-headline">
            <div className="flex items-center gap-3">
              <h2 className="dossier-name">{profile?.name}</h2>
              <span className="badge badge-primary">{profile?.roll_number}</span>
            </div>
            <p className="dossier-subtext">
              {profile?.department_name} ({profile?.department_code}) • Semester {profile?.semester}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Registration Details (Read-Only)</h3>
          <p className="card-subtitle">
            Contact the academic registrar to request official profile corrections
          </p>
        </div>

        <div className="form-grid p-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="profile-field-box">
            <span className="profile-field-label">Full Name</span>
            <span className="profile-field-val">{profile?.name}</span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Roll Number</span>
            <span className="profile-field-val text-primary font-semibold">
              {profile?.roll_number}
            </span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Institutional Email</span>
            <span className="profile-field-val">{profile?.email}</span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Department</span>
            <span className="profile-field-val">
              {profile?.department_name} ({profile?.department_code})
            </span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Current Semester</span>
            <span className="profile-field-val">Semester {profile?.semester}</span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Year of Admission</span>
            <span className="profile-field-val">{profile?.admission_year}</span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Contact Phone</span>
            <span className="profile-field-val">{profile?.phone || 'Not listed'}</span>
          </div>

          <div className="profile-field-box">
            <span className="profile-field-label">Date of Birth</span>
            <span className="profile-field-val">{formatDate(profile?.date_of_birth)}</span>
          </div>

          <div className="profile-field-box form-col-full">
            <span className="profile-field-label">Residential Address</span>
            <span className="profile-field-val">{profile?.address || 'Not listed'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
