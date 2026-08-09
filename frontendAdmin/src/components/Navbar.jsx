import React from 'react';
import '../style/Navbar.css';

export default function Navbar({ activeNav = 'Services/Formalities' }) {
  const navItems = [
    { label: 'Main Page', href: '#' },
    { label: 'About PSP', href: '#' },
    { label: 'Publicity/Information', href: '#' },
    { label: 'Performance Pledge', href: '#' },
    { label: 'Services/Formalities', href: '#' },
    { label: 'Downloadable Forms', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'PSP Activities', href: '#' }
  ];

  return (
    <nav className="main-navbar" aria-label="Main Navigation">
      <ul className="nav-menu-list">
        {navItems.map((item, index) => {
          const isActive = item.label === activeNav;
          return (
            <li key={index} className={`nav-menu-item ${isActive ? 'active' : ''}`}>
              <a href={item.href} className="nav-menu-link">
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
