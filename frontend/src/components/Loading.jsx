import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading records...' }) {
  return (
    <div className="loading-container">
      <Loader2 className="loading-spinner" size={36} />
      <p className="loading-text">{message}</p>
    </div>
  );
}
