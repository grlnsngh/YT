import React from 'react';

const StatusMessage = ({ status, isDownloading }) => {
  // Show status when NOT downloading, or when there's an error during download
  if (!status) return null;
  
  // Don't show during normal downloading (ProgressSection handles that)
  // But DO show errors even during downloading
  if (isDownloading && !status.includes('Error')) return null;

  const isError = status.includes('Error');
  
  return (
    <div className={`status-message ${isError ? 'error' : 'success'}`}>
      {status}
    </div>
  );
};

export default StatusMessage;
