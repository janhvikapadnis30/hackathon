import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import * as academicService from '../../services/academicService';
import * as studentService from '../../services/studentService';
import { BookOpen, Users, CalendarCheck, GraduationCap, ArrowRight } from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        setError('');
        const [coursesRes, studentsRes] = await Promise.all([
          academicService.getCourses(),
          studentService.getStudents(),
        ]);
        setCourses(coursesRes.data || []);
        setTotalStudents(studentsRes.data?.length || 0);
      } catch (err) {
        setError('Failed to load faculty portal data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) return <Loading message="Loading faculty portal..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.name || 'Professor'}. Manage your academic classes, attendance, and student evaluations.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid mb-6">
        <StatCard
          title="Active Courses"
          value={courses.length}
          subtitle="Assigned department courses"
          icon={BookOpen}
          color="blue"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        />
        <StatCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle="Across active semesters"
          icon={Users}
          color="indigo"
          onClick={() => navigate('/faculty/students')}
        />
        <StatCard
          title="Attendance Tracking"
          value="Active"
          subtitle="Server-calculated compliance"
          icon={CalendarCheck}
          color="emerald"
          onClick={() => navigate('/faculty/attendance')}
        />
        <StatCard
          title="Grade Evaluations"
          value="Automated"
          subtitle="Academic scale A+ to F"
          icon={GraduationCap}
          color="amber"
          onClick={() => navigate('/faculty/results')}
        />
      </div>

      {/* Quick Action Cards */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Academic Shortcuts</h3>
        </div>
        <div className="quick-actions-grid">
          <button onClick={() => navigate('/faculty/attendance')} className="quick-action-btn">
            <CalendarCheck className="quick-action-icon text-indigo" size={24} />
            <div className="quick-action-text">
              <h4>Mark Attendance</h4>
              <p>Record attended sessions by class and course</p>
            </div>
          </button>
          <button onClick={() => navigate('/faculty/results')} className="quick-action-btn">
            <GraduationCap className="quick-action-icon text-emerald" size={24} />
            <div className="quick-action-text">
              <h4>Enter Exam Marks</h4>
              <p>Record exam marks and view server-calculated grades</p>
            </div>
          </button>
          <button onClick={() => navigate('/faculty/students')} className="quick-action-btn">
            <Users className="quick-action-icon text-blue" size={24} />
            <div className="quick-action-text">
              <h4>Student Directory</h4>
              <p>Look up enrolled student profiles and contact info</p>
            </div>
          </button>
        </div>
      </div>

      {/* Assigned Department Courses */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title">Assigned Departmental Courses</h3>
            <p className="card-subtitle">Curriculum catalog available for attendance and grading</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Credits</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.slice(0, 8).map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-primary">{c.course_code}</td>
                  <td>{c.course_name}</td>
                  <td>
                    <span className="badge badge-info">{c.department_code}</span>
                  </td>
                  <td>Semester {c.semester}</td>
                  <td>{c.credits} Credits</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => navigate('/faculty/attendance')}
                      className="btn btn-outline btn-sm"
                    >
                      Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
