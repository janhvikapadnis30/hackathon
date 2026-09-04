import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  FileText,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role, logout } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/admin/fees', label: 'Fee Management', icon: CreditCard },
    { to: '/admin/results', label: 'Results', icon: GraduationCap },
    { to: '/admin/reports', label: 'Reports & Export', icon: FileText },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/students', label: 'Student Directory', icon: Users },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { to: '/faculty/results', label: 'Enter Results', icon: GraduationCap },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: UserCheck },
    { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/student/fees', label: 'My Fee Invoices', icon: CreditCard },
    { to: '/student/results', label: 'My Results', icon: GraduationCap },
  ];

  let navItems = [];
  if (role === 'admin') navItems = adminLinks;
  else if (role === 'faculty') navItems = facultyLinks;
  else if (role === 'student') navItems = studentLinks;

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`erp-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-portal-tag">{role?.toUpperCase()} PORTAL</span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="sidebar-menu-item">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active-link' : ''}`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <Icon size={18} className="sidebar-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
