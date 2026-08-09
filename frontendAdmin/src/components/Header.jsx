import React, { useState } from 'react';
import GoogleTranslate from './GoogleTranslate';
import '../style/Header.css';

export default function Header({ bannerSrc }) {
  const [imgError, setImgError] = useState(false);
  // Default path for header image provided by user
  const imagePath = bannerSrc || '/banner.jpg';

  return (
    <header className="header-container">
      {/* Top Utility Toolbar */}
      <div className="top-bar">
        <div className="top-bar-right">
          {/* Multi-language selector with Google Translate */}
          <GoogleTranslate />

          <span className="top-bar-divider">|</span>
          <a href="#links" className="top-bar-link">Links</a>
          <span className="top-bar-divider">|</span>

          {/* Search box */}
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search" 
              className="search-input" 
              aria-label="Search site"
            />
            <button className="search-btn" title="Search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Banner Image Section */}
      <div className="banner-wrapper">
        {!imgError ? (
          <img
            src={imagePath}
            alt="Corpo de Polícia de Segurança Pública - 治安警察局"
            className="header-banner-img"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Styled Fallback Header replicating exact crest and calligraphy when img is missing */
          <div className="header-banner-fallback">
            <div className="banner-left">
              <div className="cpsp-emblem-badge">
                <svg className="cpsp-emblem-svg" viewBox="0 0 100 100">
                  <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="4"/>
                  <circle cx="50" cy="50" r="30" fill="#047857" stroke="#fbbf24" strokeWidth="2"/>
                  <polygon points="50,25 58,40 75,42 62,54 66,70 50,62 34,70 38,54 25,42 42,40" fill="#facc15"/>
                </svg>
              </div>
              <div className="banner-titles">
                <div className="banner-title-cn">治安警察局</div>
                <div className="banner-title-pt">Corpo de Polícia de Segurança Pública</div>
              </div>
            </div>
            <div className="banner-right-cursive">
              The PSP pursues the goals of integrity, high efficiency, competence and professionalism.
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
