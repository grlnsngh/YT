// Format bytes to human readable string
export const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  let kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  let mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  let gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};
// Utility functions for formatting
export const formatSpeed = (bytesPerSecond) => {
  if (bytesPerSecond === 0) return '';
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  if (bytesPerSecond < 1024 * 1024 * 1024) return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(1)} GB/s`;
};

export const formatETA = (seconds) => {
  if (!seconds || seconds <= 0) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(
    dateString.substring(0, 4) + '-' +
    dateString.substring(4, 6) + '-' +
    dateString.substring(6, 8)
  ).toLocaleDateString();
};

export const formatNumber = (number) => {
  if (!number) return '';
  return number.toLocaleString();
};
