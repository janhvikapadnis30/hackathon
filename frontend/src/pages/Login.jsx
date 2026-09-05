import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, UserCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate API delay for realism
    setTimeout(() => {
      login(role);
      
      // Navigate based on role
      let redirect = '/student/dashboard';
      if (role === 'admin') redirect = '/admin/dashboard';
      if (role === 'faculty') redirect = '/faculty/dashboard';
      
      navigate(redirect, { replace: true });
    }, 800);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img src="/camp-co-logo.jpg" alt="Camp-co Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '12px', objectFit: 'cover' }} />
          <h1 style={styles.title}>Camp-co</h1>
          <p style={styles.subtitle}>Secure Access Portal</p>
        </div>

        {error && <div className="alert alert-danger" style={{marginBottom: '20px'}}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Login As</label>
            <div style={styles.inputWrapper}>
              <UserCircle size={18} style={styles.inputIcon} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.input}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          Demo mode · Any email/password will work · Select your role to mock access level
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
    maxWidth: '450px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    marginTop: '10px',
    background: '#1a1f5e',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '24px',
  },
};
