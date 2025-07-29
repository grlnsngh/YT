import React from 'react';
import { formatDate, formatNumber } from '../utils/formatters';

const VideoInfoCard = ({ videoInfo }) => {
  if (!videoInfo) return null;

  return (
    <div className="video-info-section">
      <div className="video-info-card">
        <div className="video-thumbnail">
          <img 
            src={videoInfo.thumbnail} 
            alt={videoInfo.title}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="video-details">
          <h3 className="video-title">{videoInfo.title}</h3>
          <div className="video-meta">
            <div className="video-meta-row">
              <span className="meta-label">Channel:</span>
              <span className="meta-value">{videoInfo.uploader}</span>
            </div>
            {videoInfo.duration_string && (
              <div className="video-meta-row">
                <span className="meta-label">Duration:</span>
                <span className="meta-value">{videoInfo.duration_string}</span>
              </div>
            )}
            {videoInfo.viewCount && (
              <div className="video-meta-row">
                <span className="meta-label">Views:</span>
                <span className="meta-value">{formatNumber(videoInfo.viewCount)}</span>
              </div>
            )}
            {videoInfo.uploadDate && (
              <div className="video-meta-row">
                <span className="meta-label">Upload Date:</span>
                <span className="meta-value">{formatDate(videoInfo.uploadDate)}</span>
              </div>
            )}
            {videoInfo.likeCount && (
              <div className="video-meta-row">
                <span className="meta-label">Likes:</span>
                <span className="meta-value">{formatNumber(videoInfo.likeCount)}</span>
              </div>
            )}
          </div>
          {videoInfo.description && (
            <div className="video-description">
              <h4>Description:</h4>
              <p>{videoInfo.description.length > 200 
                ? videoInfo.description.substring(0, 200) + '...' 
                : videoInfo.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInfoCard;
