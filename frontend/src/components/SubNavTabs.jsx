import React from 'react';
import '../style/SubNavTabs.css';

export default function SubNavTabs({ activeSubTab = 'Immigration Non-Resident Workers', onTabChange }) {
  const subTabs = [
    { id: 'Traffic Affairs', label: 'Traffic Affairs' },
    { id: 'Immigration Stay/Residence', label: 'Immigration Stay/Residence' },
    { id: 'Immigration Non-Resident Workers', label: 'Immigration Non-Resident Workers' },
    { id: 'Immigration Other', label: 'Immigration Other' }
  ];

  return (
    <div className="sub-nav-container">
      {/* Breadcrumb Trail */}
      <div className="breadcrumb-trail">
        <a href="#online-system" className="breadcrumb-link">Online System</a>
        <span className="breadcrumb-separator"> &gt; </span>
        <span className="breadcrumb-current">Immigration (Non-Resident Workers)</span>
      </div>

      {/* Sub Tabs Navigation Row */}
      <div className="tabs-row" role="tablist">
        {subTabs.map((tab) => {
          const isActive = tab.id === activeSubTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`sub-tab-button ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
