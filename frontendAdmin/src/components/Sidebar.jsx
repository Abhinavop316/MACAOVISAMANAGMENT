import React from 'react';
import '../style/Sidebar.css';

export default function Sidebar() {
  const visitorDigits = ['9', '9', '5', '5', '7', '0'];

  return (
    <aside className="sidebar-container" aria-label="Sidebar navigation and quick info">
      {/* Top Menu Buttons */}
      <button className="sidebar-nav-btn">
        Number of persons waiting for service
      </button>

      <button className="sidebar-nav-btn active">
        Online System
      </button>

      <button className="sidebar-nav-btn">
        Self-service Kiosks
      </button>

      {/* Special Information Banner 1 */}
      <a href="#special-needs" className="sidebar-promo-card promo-pink">
        <div className="promo-icon-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ffffff" />
          </svg>
        </div>
        <div className="promo-text">
          Support Measures for People with Special Needs
        </div>
      </a>

      {/* Special Information Banner 2 */}
      <a href="#new-law" className="sidebar-promo-card promo-red">
        <div className="promo-icon-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#ffffff" />
          </svg>
        </div>
        <div className="promo-text">
          Information of New Immigration Law
        </div>
      </a>

      {/* Visitor Counter */}
      <div className="visitor-counter-box">
        <div className="visitor-title">Visitor counter :</div>
        <div className="odometer-digits">
          {visitorDigits.map((digit, idx) => (
            <span key={idx} className="odometer-digit">{digit}</span>
          ))}
        </div>
      </div>

      {/* Follow Us Social Grid */}
      <div className="social-section">
        <div className="social-title">Follow us</div>
        <div className="social-grid">
          {/* WeChat */}
          <div className="social-icon-badge bg-wechat" title="WeChat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.5 15c-4.14 0-7.5-2.91-7.5-6.5S4.36 2 8.5 2s7.5 2.91 7.5 6.5c0 1.34-.47 2.59-1.28 3.61l.85 2.55-2.61-.83C11.66 14.53 10.14 15 8.5 15zm8.25-2c.16 0 .33.01.5.02-.31 2.9-3.21 5.23-6.75 5.23-.67 0-1.32-.08-1.93-.24l-2.07.66.67-2.02c-.85-.88-1.42-2.04-1.42-3.32 0-.2.02-.4.05-.59C8.36 13.5 10.63 14 13 14c1.29 0 2.53-.16 3.75-.48z"/>
            </svg>
          </div>
          {/* Weibo */}
          <div className="social-icon-badge bg-weibo" title="Weibo">
            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>W</span>
          </div>
          {/* Facebook */}
          <div className="social-icon-badge bg-facebook" title="Facebook">
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>f</span>
          </div>
          {/* Instagram */}
          <div className="social-icon-badge bg-instagram" title="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </div>
          {/* YouTube */}
          <div className="social-icon-badge bg-youtube" title="YouTube">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          {/* Red / Xiaohongshu */}
          <div className="social-icon-badge bg-red" title="Xiaohongshu">
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>RED</span>
          </div>
          {/* Douyin / TikTok */}
          <div className="social-icon-badge bg-tiktok" title="TikTok">
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>♪</span>
          </div>
          {/* Mobile App */}
          <div className="social-icon-badge bg-app" title="Mobile App">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="mobile-app-label">Mobile App</div>

        {/* CPSP Shield Crest */}
        <div className="cpsp-shield-mini">
          <svg viewBox="0 0 100 100" width="36" height="36">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="4"/>
            <polygon points="50,25 58,40 75,42 62,54 66,70 50,62 34,70 38,54 25,42 42,40" fill="#facc15"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}
