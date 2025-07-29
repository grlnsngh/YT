// Custom hook for download history management
import { useState } from 'react';

export const useDownloadHistory = () => {
  const [downloadHistory, setDownloadHistory] = useState([]);

  const addToHistory = (item) => {
    const newHistoryItem = {
      url: item.url,
      title: item.title,
      filename: item.filename,
      timestamp: new Date().toLocaleString()
    };
    
    setDownloadHistory(prev => {
      const isDuplicate = prev.some(historyItem => 
        historyItem.url === item.url && historyItem.title === item.title
      );
      return isDuplicate ? prev : [...prev, newHistoryItem];
    });
  };

  const clearHistory = () => {
    setDownloadHistory([]);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, message: 'URL copied to clipboard!' };
    } catch (error) {
      return { success: false, message: 'Failed to copy URL to clipboard' };
    }
  };

  return {
    downloadHistory,
    addToHistory,
    clearHistory,
    copyToClipboard
  };
};
