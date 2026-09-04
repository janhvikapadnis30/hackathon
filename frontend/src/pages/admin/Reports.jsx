import React, { useState } from 'react';
import * as reportService from '../../services/reportService';
import { FileText, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function Reports() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleDownload = async (id, downloadFn, label) => {
    try {
      setDownloadingId(id);
      setStatusMessage({ type: 'info', text: `Generating ${label}... Please wait.` });
      await downloadFn();
      setStatusMessage({ type: 'success', text: `${label} downloaded successfully!` });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Failed to generate ${label}. Please verify that the backend is running.`,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const pdfReports = [
    {
      id: 'pdf-attendance',
      title: 'Institutional Attendance Register (PDF)',
      description: 'Tabulated class attendance across all courses and departments.',
      fn: () => reportService.downloadAttendancePDF(),
    },
    {
      id: 'pdf-fees',
      title: 'Fee Audit & Collection Report (PDF)',
      description: 'Comprehensive financial audit showing total billed, collected, and pending dues.',
      fn: () => reportService.downloadFeesPDF(),
    },
    {
      id: 'pdf-results',
      title: 'Examination Results Sheet (PDF)',
      description: 'Master examination score sheet with marks and calculated letter grades.',
      fn: () => reportService.downloadResultsPDF(),
    },
  ];

  const excelReports = [
    {
      id: 'excel-students',
      title: 'Students Master Roster (Excel)',
      description: 'Complete student roster spreadsheet with roll numbers, departments, and contact info.',
      fn: () => reportService.downloadStudentsExcel(),
    },
    {
      id: 'excel-attendance',
      title: 'Attendance Ledger (Excel)',
      description: 'Course-by-course attendance data formatted with styled headers and percentages.',
      fn: () => reportService.downloadAttendanceExcel(),
    },
    {
      id: 'excel-fees',
      title: 'Fee Audit Ledger (Excel)',
      description: 'Institutional billing ledger with individual student dues and summary totals row.',
      fn: () => reportService.downloadFeesExcel(),
    },
    {
      id: 'excel-results',
      title: 'Examination Results (Excel)',
      description: 'Complete examination scores and grades export ready for spreadsheet analysis.',
      fn: () => reportService.downloadResultsExcel(),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Institutional Reports & Exports</h1>
          <p className="page-subtitle">
            Generate and download official PDF documents (PDFKit) and Excel workbooks (ExcelJS).
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div
          className={`alert ${
            statusMessage.type === 'success'
              ? 'alert-success'
              : statusMessage.type === 'error'
              ? 'alert-danger'
              : 'alert-info'
          } mb-6`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* PDF Reports Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={22} className="text-danger" />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
            Official PDF Reports (PDFKit)
          </h2>
        </div>
        <div className="reports-grid">
          {pdfReports.map((rep) => (
            <div key={rep.id} className="card report-card">
              <div className="report-card-icon-wrap icon-bg-danger">
                <FileText size={28} />
              </div>
              <h3 className="report-card-title">{rep.title}</h3>
              <p className="report-card-desc">{rep.description}</p>
              <button
                onClick={() => handleDownload(rep.id, rep.fn, rep.title)}
                className="btn btn-outline w-full mt-auto"
                disabled={downloadingId === rep.id}
              >
                <Download size={16} />
                {downloadingId === rep.id ? 'Generating PDF...' : 'Download PDF Document'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Excel Reports Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={22} className="text-emerald" />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
            Excel Workbooks & Data Sheets (ExcelJS)
          </h2>
        </div>
        <div className="reports-grid">
          {excelReports.map((rep) => (
            <div key={rep.id} className="card report-card">
              <div className="report-card-icon-wrap icon-bg-emerald">
                <FileSpreadsheet size={28} />
              </div>
              <h3 className="report-card-title">{rep.title}</h3>
              <p className="report-card-desc">{rep.description}</p>
              <button
                onClick={() => handleDownload(rep.id, rep.fn, rep.title)}
                className="btn btn-outline w-full mt-auto"
                disabled={downloadingId === rep.id}
              >
                <Download size={16} />
                {downloadingId === rep.id ? 'Generating Excel...' : 'Export to Excel (.xlsx)'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
