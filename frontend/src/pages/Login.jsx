import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      if (res.role === 'admin') navigate('/admin/dashboard');
      else if (res.role === 'faculty') navigate('/faculty/dashboard');
      else if (res.role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for convenience during demo/grading
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Left Branding Column */}
        <div className="login-brand-panel">
          <div className="brand-badge">
            <GraduationCap size={28} />
            <h2>Apex Institute ERP</h2>
          </div>
          <p className="brand-tagline">
            Next-Generation Integrated Academic & Student Information Management System
          </p>

          <div className="brand-features-list">
            <div className="feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Role-Based Access Control (Admin, Faculty, Student)</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Automated Attendance Tracking & Percentage Calculations</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Comprehensive Fee Management with Dues & Ledgers</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Native PDF & Excel Report Exports via PDFKit & ExcelJS</span>
            </div>
          </div>

          <div className="quick-creds-box">
            <p className="quick-creds-title">Demo Test Accounts:</p>
            <div className="quick-creds-pills">
              <button
                type="button"
                className="cred-pill"
                onClick={() => fillCredentials('admin@erp.com', 'Admin@123')}
              >
                Admin (admin@erp.com)
              </button>
              <button
                type="button"
                className="cred-pill"
                onClick={() => fillCredentials('faculty@erp.com', 'Faculty@123')}
              >
                Faculty (faculty@erp.com)
              </button>
              <button
                type="button"
                className="cred-pill"
                onClick={() => fillCredentials('student1@erp.com', 'Student@123')}
              >
                Student (student1@erp.com)
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h3>Sign in to your account</h3>
            <p>Enter your institutional credentials to access your ERP portal</p>
          </div>

          {errorMessage && <div className="login-error-alert">{errorMessage}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Institutional Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@erp.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-form-footer">
            <span>Secured via PostgreSQL + JWT Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
