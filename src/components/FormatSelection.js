import React from 'react';

const FormatSelection = ({ 
  availableFormats, 
  selectedFormat, 
  onFormatChange, 
  isDownloading 
}) => {
  if (availableFormats.length === 0) return null;

  return (
    <div className="format-selection">
      <label htmlFor="format-select">Choose format:</label>
      <select
        id="format-select"
        value={selectedFormat}
        onChange={(e) => onFormatChange(e.target.value)}
        disabled={isDownloading}
      >
        {availableFormats.map((fmt) => (
          <option key={fmt.id} value={fmt.id}>
            {fmt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormatSelection;
