import React from 'react';
import { Landmark } from 'lucide-react';

export default function AdminDepartments() {
  const depts = [
    { id: 1, name: 'Computer Science', code: 'CS', hod: 'Dr. Anita Verma', students: 180 },
    { id: 2, name: 'Electronics Engineering', code: 'EC', hod: 'Dr. Suresh Nair', students: 150 },
    { id: 3, name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Ramesh Gupta', students: 140 },
    { id: 4, name: 'Civil Engineering', code: 'CE', hod: 'Dr. Pooja Mehta', students: 120 },
    { id: 5, name: 'Information Technology', code: 'IT', hod: 'Dr. Vikram Rao', students: 160 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Departments</h1>
          <p className="page-subtitle">Manage institutional faculties and branches</p>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Head of Department</th>
                <th>Enrolled Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {depts.map(d => (
                <tr key={d.id}>
                  <td className="font-semibold">{d.code}</td>
                  <td className="font-semibold text-primary flex items-center gap-2">
                    <Landmark size={16} /> {d.name}
                  </td>
                  <td>{d.hod}</td>
                  <td>{d.students}</td>
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
