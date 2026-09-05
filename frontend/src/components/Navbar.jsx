import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, role, logout } = useAuth();

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin':
        return 'role-badge-admin';
      case 'faculty':
        return 'role-badge-faculty';
      case 'student':
        return 'role-badge-student';
      default:
        return 'role-badge-default';
    }
  };

  return (
    <header className="erp-navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="navbar-brand">
          <div className="brand-logo-circle">ERP</div>
          <span className="brand-text">Camp-co</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-profile-widget">
          <div className="user-avatar-circle">
            <User size={16} />
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.name || 'Authorized User'}</span>
            <span className={`role-chip ${getRoleBadgeClass()}`}>
              {role?.toUpperCase()}
            </span>
          </div>
        </div>

        <button onClick={logout} className="navbar-logout-btn" title="Sign out of ERP">
          <LogOut size={16} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}
