import React from 'react';
import { UserCheck } from 'lucide-react';

export default function AdminFaculty() {
  const facultyList = [
    { id: 1, name: 'Dr. Priya Sharma', email: 'admin@camp-co.com', dept: 'Administration', role: 'Dean' },
    { id: 2, name: 'Prof. Rajesh Kumar', email: 'faculty1@camp-co.com', dept: 'Computer Science', role: 'Senior Professor' },
    { id: 3, name: 'Dr. Anita Verma', email: 'averma@camp-co.com', dept: 'Computer Science', role: 'HOD' },
    { id: 4, name: 'Dr. Suresh Nair', email: 'snair@camp-co.com', dept: 'Electronics Engineering', role: 'HOD' },
    { id: 5, name: 'Dr. Ramesh Gupta', email: 'rgupta@camp-co.com', dept: 'Mechanical Engineering', role: 'HOD' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Directory</h1>
          <p className="page-subtitle">Manage teaching staff and department heads</p>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map(f => (
                <tr key={f.id}>
                  <td className="font-semibold text-primary flex items-center gap-2">
                    <UserCheck size={16} /> {f.name}
                  </td>
                  <td>{f.email}</td>
                  <td><span className="badge badge-info">{f.dept}</span></td>
                  <td>{f.role}</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
