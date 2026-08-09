import React, { useState } from 'react';
import '../style/SystemCard.css';

export default function SystemCard({ service, onSelectService }) {
  const { title, subtitle, description, relevantInfo, systemName, thumbnailType, image } = service;
  const [imgError, setImgError] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (onSelectService) {
      onSelectService(service);
    }
  };

  // Render thumbnail (actual image or mock fallback)
  const renderThumbnail = () => {
    if (image && !imgError) {
      return (
        <div className="thumbnail-frame" title={systemName} onClick={handleClick}>
          <img
            src={image}
            alt={systemName}
            className="thumbnail-real-img"
            onError={() => setImgError(true)}
          />
        </div>
      );
    }

    return (
      <div className="thumbnail-frame" title={systemName} onClick={handleClick}>
        <div className="mock-window">
          {/* Header bar of the inner system preview */}
          <div className="mock-window-header">
            <div className="mock-header-badge"></div>
            <span>治安警察局</span>
          </div>

          <div className="mock-window-body">
            <div className="mock-banner-bar">
              {systemName.length > 25 ? systemName.substring(0, 24) + '...' : systemName}
            </div>

            {thumbnailType === 'onlineservices' && (
              <div className="mock-tooltip">Online Services for Non resident Workers</div>
            )}

            <div className="mock-form-group">
              <div className="mock-input" style={{ width: '80%' }}></div>
              <div className="mock-input" style={{ width: '60%' }}></div>
            </div>

            <div className="mock-btn"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="system-card">
      {/* Left side text section */}
      <div className="system-card-left">
        <div className="system-card-header">
          <div className="system-blue-arrow">➡️</div>
          <div className="system-title-group">
            <a href="#system" className="system-card-title" onClick={handleClick}>
              {title}
            </a>
            {subtitle && <div className="system-card-subtitle">{subtitle}</div>}
          </div>
        </div>

        <p className="system-card-description">{description}</p>

        {relevantInfo && (
          <div className="relevant-info-box">
            <span className="relevant-info-label">{relevantInfo.label}</span>
            <a href={relevantInfo.url} className="relevant-info-link" onClick={handleClick}>
              {relevantInfo.text}
            </a>
          </div>
        )}
      </div>

      {/* Right side thumbnail screenshot section */}
      <div className="system-card-right">
        {renderThumbnail()}
      </div>
    </div>
  );
}
