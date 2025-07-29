import React from 'react';

const URLInput = ({ 
  url, 
  onUrlChange, 
  onKeyPress, 
  onGetInfo, 
  isDownloading, 
  isGettingInfo 
}) => {
  return (
    <div className="input-group">
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Enter YouTube URL here..."
        className="url-input"
        disabled={isDownloading}
      />
      <button 
        onClick={onGetInfo}
        disabled={isDownloading || isGettingInfo || !url.trim()}
        className="info-button"
      >
        {isGettingInfo ? 'Getting Info...' : 'Get Info'}
      </button>
    </div>
  );
};

export default URLInput;
