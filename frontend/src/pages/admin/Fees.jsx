import React, { useState, useEffect } from 'react';
import * as feeService from '../../services/feeService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import { formatCurrency, formatDate, getFeeBadge } from '../../utils/helpers';
import { CreditCard, Search, DollarSign, Filter, Plus } from 'lucide-react';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ total_records: 0, total_collected: 0, total_outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentFee, setCurrentFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadFees = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedSemester) params.semester = selectedSemester;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await feeService.getAllFees(params);
      setFees(res.data || []);
      if (res.summary) setSummary(res.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load institutional fee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [selectedStatus, selectedSemester]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadFees();
  };

  const openPaymentModal = (fee) => {
    setCurrentFee(fee);
    setPaymentAmount('');
    setModalError('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const payVal = parseFloat(paymentAmount);
    if (isNaN(payVal) || payVal <= 0) {
      setModalError('Please enter a valid payment amount greater than zero.');
      return;
    }

    const currentPaid = parseFloat(currentFee.amount_paid);
    const totalFee = parseFloat(currentFee.total_fee);
    const newPaid = currentPaid + payVal;

    if (newPaid > totalFee) {
      setModalError(`Payment cannot exceed the outstanding balance of ${formatCurrency(currentFee.amount_due)}.`);
      return;
    }

    try {
      setSubmittingPayment(true);
      await feeService.updateFee(currentFee.id, { amount_paid: newPaid });
      setIsPaymentModalOpen(false);
      setSuccessMsg(`Payment of ${formatCurrency(payVal)} recorded for Roll No: ${currentFee.roll_number}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadFees();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Management & Ledgers</h1>
          <p className="page-subtitle">Monitor institutional billing, payment collections, and outstanding dues.</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={loadFees} />}

      {/* Summary KPI Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Total Invoiced</p>
              <h3 className="stat-card-value">{formatCurrency(summary.total_collected + summary.total_outstanding)}</h3>
              <p className="stat-card-subtitle">{summary.total_records} fee invoices</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-blue">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Total Fees Collected</p>
              <h3 className="stat-card-value">{formatCurrency(summary.total_collected)}</h3>
              <p className="stat-card-subtitle">Realized payments</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-emerald">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-card-body">
            <div>
              <p className="stat-card-title">Outstanding Balance Due</p>
              <h3 className="stat-card-value">{formatCurrency(summary.total_outstanding)}</h3>
              <p className="stat-card-subtitle">Pending collection</p>
            </div>
            <div className="stat-card-icon-wrap icon-bg-amber">
              <CreditCard size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-bar-card mb-6">
        <form onSubmit={handleSearch} className="filter-bar-form">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </div>

          <div className="filters-right">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              <option value="">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="PENDING">PENDING</option>
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-select"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Fees Table */}
      <div className="card">
        {loading ? (
          <Loading message="Loading fee records..." />
        ) : (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>Total Fee</th>
                  <th>Amount Paid</th>
                  <th>Amount Due</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="table-empty-cell">
                      No fee records match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  fees.map((fee) => {
                    const b = getFeeBadge(fee.status);
                    return (
                      <tr key={fee.id}>
                        <td className="font-semibold text-primary">{fee.roll_number}</td>
                        <td>{fee.student_name}</td>
                        <td>{fee.department_code}</td>
                        <td>Sem {fee.semester}</td>
                        <td>{formatCurrency(fee.total_fee)}</td>
                        <td>{formatCurrency(fee.amount_paid)}</td>
                        <td className="font-semibold text-danger">{formatCurrency(fee.amount_due)}</td>
                        <td>{formatDate(fee.due_date)}</td>
                        <td>
                          <span className={`badge ${b.className}`}>{b.label}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {parseFloat(fee.amount_due) > 0 ? (
                            <button
                              onClick={() => openPaymentModal(fee)}
                              className="btn btn-outline btn-sm"
                            >
                              Collect
                            </button>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '13px' }}>
                              Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Entry Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment — ${currentFee?.student_name} (${currentFee?.roll_number})`}
        maxWidth="500px"
      >
        {modalError && <div className="alert alert-danger">{modalError}</div>}
        <form onSubmit={handlePaymentSubmit}>
          <div className="fee-breakdown-box mb-4">
            <div className="flex justify-between py-1">
              <span>Total Semester Fee:</span>
              <strong>{formatCurrency(currentFee?.total_fee)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Already Paid:</span>
              <strong className="text-emerald">{formatCurrency(currentFee?.amount_paid)}</strong>
            </div>
            <div className="flex justify-between py-1" style={{ borderTop: '1px solid #e5e7eb', marginTop: '4px' }}>
              <span>Outstanding Due:</span>
              <strong className="text-danger">{formatCurrency(currentFee?.amount_due)}</strong>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Amount to Record (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              max={currentFee?.amount_due}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max: ${currentFee?.amount_due}`}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingPayment}>
              {submittingPayment ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
