import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    key: 'admin',
    label: 'Administrator',
    description: 'Full system access · Manage students, faculty, fees & reports',
    icon: '🛡️',
    color: '#3b5bdb',
    bg: '#eef2ff',
    redirect: '/admin/dashboard',
  },
  {
    key: 'faculty',
    label: 'Faculty',
    description: 'Mark attendance · Enter results · View student progress',
    icon: '👨‍🏫',
    color: '#2f9e44',
    bg: '#ebfbee',
    redirect: '/faculty/dashboard',
  },
  {
    key: 'student',
    label: 'Student',
    description: 'View attendance, fees, results & academic profile',
    icon: '🎓',
    color: '#e67700',
    bg: '#fff9db',
    redirect: '/student/dashboard',
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleSelect = (role) => {
    setLoading(role.key);
    login(role.key);
    setTimeout(() => navigate(role.redirect, { replace: true }), 300);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img src="/camp-co-logo.jpg" alt="Camp-co Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '12px', objectFit: 'cover' }} />
          <h1 style={styles.title}>Camp-co</h1>
          <p style={styles.subtitle}>Next-Generation Integrated Academic & Student Information Management System</p>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>Select your role to continue</span>
        </div>

        {/* Role Cards */}
        <div style={styles.roleGrid}>
          {roles.map((role) => (
            <button
              key={role.key}
              style={{
                ...styles.roleCard,
                borderColor: loading === role.key ? role.color : '#e5e7eb',
                background: loading === role.key ? role.bg : '#fff',
                opacity: loading && loading !== role.key ? 0.5 : 1,
              }}
              onClick={() => handleSelect(role)}
              disabled={!!loading}
            >
              <div style={{ ...styles.roleIcon, background: role.bg }}>{role.icon}</div>
              <div style={styles.roleLabel} >{role.label}</div>
              <div style={styles.roleDesc}>{role.description}</div>
              <div style={{ ...styles.roleBadge, background: role.color }}>
                {loading === role.key ? 'Loading…' : 'Enter as ' + role.label}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          Demo mode · No login required · All data is sample data
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1f5e 0%, #2d4a8a 50%, #1a6b8a 100%)',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '48px 40px 36px',
    width: '100%',
    maxWidth: '700px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '52px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.5,
  },
  divider: {
    textAlign: 'center',
    position: 'relative',
    marginBottom: '28px',
  },
  dividerText: {
    background: '#fff',
    padding: '0 16px',
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  roleCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '14px',
    padding: '24px 16px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  roleIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
  },
  roleLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  roleDesc: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.5,
  },
  roleBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '4px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
};
