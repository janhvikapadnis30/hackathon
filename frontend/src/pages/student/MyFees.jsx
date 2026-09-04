import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as feeService from '../../services/feeService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency, formatDate, getFeeBadge } from '../../utils/helpers';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function MyFees() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.student_id) {
      setError('Student identity could not be verified.');
      setLoading(false);
      return;
    }

    const loadFees = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await feeService.getFeesByStudent(user.student_id);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load fee information.');
      } finally {
        setLoading(false);
      }
    };

    loadFees();
  }, [user]);

  if (loading) return <Loading message="Loading fee statement..." />;
  if (error) return <ErrorMessage message={error} />;

  const summary = data?.summary || { total_invoiced: 0, total_paid: 0, total_due: 0 };
  const records = data?.data || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Fee Statement</h1>
          <p className="page-subtitle">Inspect your semester fee obligations, payment history, and balance dues.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Total Invoiced</p>
              <h3 className="stat-card-value">{formatCurrency(summary.total_invoiced)}</h3>
              <p className="stat-card-subtitle">Tuition & campus fees</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-blue">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Total Amount Paid</p>
              <h3 className="stat-card-value">{formatCurrency(summary.total_paid)}</h3>
              <p className="stat-card-subtitle">Receipts verified</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-emerald">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Balance Due</p>
              <h3 className="stat-card-value">{formatCurrency(summary.total_due)}</h3>
              <p className="stat-card-subtitle">
                {summary.total_due > 0 ? 'Pending payment' : 'All cleared'}
              </p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-amber">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Invoices Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Semester Invoices (Read-Only)</h3>
          <p className="card-subtitle">Official billing ledger managed by the Finance Department</p>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Total Fee</th>
                <th>Amount Paid</th>
                <th>Amount Due</th>
                <th>Payment Due Date</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    No fee invoices found for your student profile.
                  </td>
                </tr>
              ) : (
                records.map((fee) => {
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
    </div>
  );
}
