import React from "react";
import { formatSpeed, formatETA, formatBytes } from "../utils/formatters";

const ProgressSection = ({
  isDownloading,
  status,
  progress,
  downloadSpeed,
  eta,
  downloaded,
  total,
}) => {
  if (!isDownloading) return null;

  const isProcessing =
    status.includes("Processing") || status.includes("processing");

  return (
    <div className="progress-section">
      {isProcessing ? (
        <div className="processing-loader">
          <div className="loader-spinner"></div>
          <div className="loader-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
          <div className="processing-text">{status}</div>
        </div>
      ) : (
        <>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="progress-overlay">
              <span className="progress-text">{progress.toFixed(1)}%</span>
              {(downloaded !== null || total !== null) && (
                <span
                  className="progress-size"
                  style={{ marginLeft: 12, fontSize: "0.95em", color: "#888" }}
                >
                  {downloaded !== null && !isNaN(downloaded)
                    ? formatBytes(downloaded)
                    : "0 B"}
                  {" / "}
                  {total !== null && !isNaN(total) && total > 0
                    ? formatBytes(total)
                    : "Unknown"}
                </span>
              )}
            </div>
          </div>
          <div className="download-info">
            <div className="download-status">{status}</div>
            <div className="download-stats">
              <span className="download-speed">
                ⚡{" "}
                {downloadSpeed > 0
                  ? formatSpeed(downloadSpeed)
                  : "Calculating..."}
              </span>
              <span className="download-eta">
                ⏱️ {eta ? `${formatETA(eta)} remaining` : "Calculating..."}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressSection;
