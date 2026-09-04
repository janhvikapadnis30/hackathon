import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'An error occurred.', onRetry }) {
  return (
    <div className="error-banner">
      <div className="error-banner-content">
        <AlertCircle size={20} className="error-icon" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-btn">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
