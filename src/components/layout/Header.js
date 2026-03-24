import React from 'react';
import './Header.css';

const NAV_LINKS = ['Home', 'Therapists', 'Sales', 'Clients', 'Transactions', 'Reports'];

const Header = ({ onDateChange, activeNav = 'Home' }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="header-logo">
          <span className="logo-text">Logo</span>
        </div>

        {/* Nav Links */}
        <nav className="header-nav">
          {NAV_LINKS.map(link => (
            <a
              key={link}
              href="#"
              className={`nav-link ${link === activeNav ? 'active' : ''}`}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="header-actions">
          <button className="icon-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <div className="avatar-btn">
            <span>A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
