import React from 'react';

const DownloadPathSelector = ({ 
  downloadPath, 
  onChooseFolder, 
  isDownloading 
}) => {
  return (
    <div className="download-path-section">
      <div className="download-location-label">Download Location:</div>
      <div className="path-display">
        <span className="path-text">{downloadPath}</span>
        <button 
          onClick={onChooseFolder}
          disabled={isDownloading}
          className="choose-folder-button"
        >
          📁 Choose Folder
        </button>
      </div>
    </div>
  );
};

export default DownloadPathSelector;
