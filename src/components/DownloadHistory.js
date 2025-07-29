import React from 'react';

const DownloadHistory = ({ 
  downloadHistory, 
  onClearHistory, 
  onCopyUrl 
}) => {
  if (downloadHistory.length === 0) return null;

  return (
    <div className="history-section">
      <div className="history-header">
        <h3>Download History</h3>
        <button onClick={onClearHistory} className="clear-button">
          Clear History
        </button>
      </div>
      <div className="history-list">
        {downloadHistory.map((item, index) => (
          <div key={`${item.url}-${item.timestamp}`} className="history-item">
            <div className="history-content">
              <div className="history-title">{item.title || 'Unknown Title'}</div>
              <div className="history-url">{item.url}</div>
              <div className="history-timestamp">{item.timestamp}</div>
            </div>
            <button 
              onClick={() => onCopyUrl(item.url)}
              className="copy-url-button"
              title="Copy URL to clipboard"
            >
              📋 Copy URL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadHistory;
