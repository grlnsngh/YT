// Custom hook for download logic and state management
import { useState, useRef } from "react";

export const useDownloader = () => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("best");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGettingInfo, setIsGettingInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(null);
  const [total, setTotal] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [eta, setEta] = useState(null);
  const [status, setStatus] = useState("");
  const [availableFormats, setAvailableFormats] = useState([]);
  const [downloadPath, setDownloadPath] = useState(
    "Default (Downloads/YT-Downloads)"
  );
  const [videoInfo, setVideoInfo] = useState(null);

  // Speed and ETA throttling with refs for latest values
  const lastSpeedUpdateRef = useRef(0);
  const latestSpeedRef = useRef(0);
  const latestEtaRef = useRef(null);
  const hasShownFirstSpeedRef = useRef(false);
  const hasShownFirstEtaRef = useRef(false);

  // Simple throttling: Update UI at most once per second
  const updateSpeedAndETA = () => {
    const now = Date.now();
    if (now - lastSpeedUpdateRef.current >= 1000) {
      if (latestSpeedRef.current > 0) {
        setDownloadSpeed(latestSpeedRef.current);
      }
      if (latestEtaRef.current) {
        setEta(latestEtaRef.current);
      }
      lastSpeedUpdateRef.current = now;
    }
  };

  const parseSpeedFromStatus = (status) => {
    // Match patterns like '1.23MiB/s', '456KiB/s', '789B/s', '2.5 MB/s', etc.
    const speedMatch = status.match(/([\d.]+)\s*([KMG]?i?B)\/s/i);
    if (speedMatch) {
      let speed = parseFloat(speedMatch[1]);
      let unit = speedMatch[2].toUpperCase();
      // Normalize units (handle both KiB and KB, etc.)
      if (unit === "KB" || unit === "KIB") speed *= 1024;
      else if (unit === "MB" || unit === "MIB") speed *= 1024 * 1024;
      else if (unit === "GB" || unit === "GIB") speed *= 1024 * 1024 * 1024;
      // If unit is just B, leave as is
      return speed;
    }
    return 0;
  };

  const parseETAFromStatus = (status) => {
    // Pattern 1: ETA 00:03:45 (HH:MM:SS)
    let etaMatch = status.match(/ETA\s+(\d{2}):(\d{2}):(\d{2})/);
    if (etaMatch) {
      const hours = parseInt(etaMatch[1]);
      const minutes = parseInt(etaMatch[2]);
      const seconds = parseInt(etaMatch[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }

    // Pattern 2: ETA 03:45 (MM:SS)
    etaMatch = status.match(/ETA\s+(\d{1,2}):(\d{2})/);
    if (etaMatch) {
      const minutes = parseInt(etaMatch[1]);
      const seconds = parseInt(etaMatch[2]);
      return minutes * 60 + seconds;
    }

    // Pattern 3: ETA 45s
    etaMatch = status.match(/ETA\s+(\d+)s/);
    if (etaMatch) {
      return parseInt(etaMatch[1]);
    }

    // Pattern 4: ETA 3m 45s or ETA 3m
    etaMatch = status.match(/ETA\s+(\d+)m\s*(\d*)s?/);
    if (etaMatch) {
      const minutes = parseInt(etaMatch[1]);
      const seconds = parseInt(etaMatch[2]) || 0;
      return minutes * 60 + seconds;
    }

    return null;
  };

  const handleProgressUpdate = (progressData) => {
    // Debug: Log downloaded and total for troubleshooting
    // console.log('[Downloader] Downloaded:', progressData.downloaded, 'Total:', progressData.total);
    if (progressData.downloaded !== undefined)
      setDownloaded(progressData.downloaded);
    if (progressData.total !== undefined) setTotal(progressData.total);
    // Clamp progress to never regress after reaching 100%
    setMaxProgress((prevMax) => {
      if (progressData.progress > prevMax) return progressData.progress;
      return prevMax;
    });
    setProgress((prev) => {
      // Only allow progress to increase, or stay at max
      if (progressData.progress > prev) return progressData.progress;
      // If maxProgress is 100, clamp to 100
      if (maxProgress >= 100) return 100;
      // Otherwise, don't regress
      return prev;
    });
    setStatus(progressData.status);

    // Extract speed and ETA from yt-dlp output if available
    let currentSpeed = progressData.speed || parseSpeedFromStatus(progressData.status);

    // Robust ETA parsing: handle raw string (e.g., '03:45', '45s', '3m 45s')
    let currentEta = null;
    if (progressData.eta) {
      let etaStr = progressData.eta.trim();
      // Pattern 1: HH:MM:SS
      let match = etaStr.match(/^(\d{2}):(\d{2}):(\d{2})$/);
      if (match) {
        currentEta = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
      } else {
        // Pattern 2: MM:SS
        match = etaStr.match(/^(\d{1,2}):(\d{2})$/);
        if (match) {
          currentEta = parseInt(match[1]) * 60 + parseInt(match[2]);
        } else {
          // Pattern 3: 45s
          match = etaStr.match(/^(\d+)s$/);
          if (match) {
            currentEta = parseInt(match[1]);
          } else {
            // Pattern 4: 3m 45s or 3m
            match = etaStr.match(/^(\d+)m\s*(\d*)s?/);
            if (match) {
              currentEta = parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
            }
          }
        }
      }
    }
    // Fallback: try to parse from status string
    if (currentEta === null) {
      currentEta = parseETAFromStatus(progressData.status);
    }

    // Always store the latest values in refs
    if (currentSpeed > 0) {
      latestSpeedRef.current = currentSpeed;
    }
    if (currentEta) {
      latestEtaRef.current = currentEta;
    }

    // Try to update UI with throttling
    updateSpeedAndETA();

    // Immediate update for first values only
    if (!hasShownFirstSpeedRef.current && currentSpeed > 0) {
      setDownloadSpeed(currentSpeed);
      lastSpeedUpdateRef.current = Date.now();
      hasShownFirstSpeedRef.current = true;
    }
    if (!hasShownFirstEtaRef.current && currentEta) {
      setEta(currentEta);
      lastSpeedUpdateRef.current = Date.now();
      hasShownFirstEtaRef.current = true;
    }
  };

  const resetDownloadState = () => {
    setProgress(0);
    setMaxProgress(0);
    setDownloaded(null);
    setTotal(null);
    setDownloadSpeed(0);
    setEta(null);
    lastSpeedUpdateRef.current = 0;
    latestSpeedRef.current = 0;
    latestEtaRef.current = null;
    hasShownFirstSpeedRef.current = false;
    hasShownFirstEtaRef.current = false;
  };

  const clearURL = () => {
    setUrl("");
  };

  const clearVideoInfo = () => {
    setVideoInfo(null);
    setAvailableFormats([]);
  };

  return {
    // State
    url,
    format,
    isDownloading,
    isGettingInfo,
    progress,
    maxProgress,
    downloaded,
    total,
    downloadSpeed,
    eta,
    status,
    availableFormats,
    downloadPath,
    videoInfo,

    // Actions
    setUrl,
    setFormat,
    setIsDownloading,
    setIsGettingInfo,
    setStatus,
    setAvailableFormats,
    setDownloadPath,
    setVideoInfo,

    // Helpers
    handleProgressUpdate,
    resetDownloadState,
    clearURL,
    clearVideoInfo,
    lastSpeedUpdateRef,
  };
};
