import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/AdminPages.css';

export default function AdminNavbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="admin-nav-bar" aria-label="Admin Navigation">
      <div className="admin-nav-brand">
        <span className="admin-badge-icon">🛡️</span>
        <span className="admin-brand-title">PSP Admin Management Portal</span>
      </div>

      <div className="admin-nav-links">
        {isLoggedIn ? (
          <>
            <NavLink
              to="/new-application"
              className={({ isActive }) =>
                `admin-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              ➕ New Application
            </NavLink>

            <NavLink
              to="/edit-application"
              className={({ isActive }) =>
                `admin-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              ✏️ Edit Application
            </NavLink>

            <div className="admin-user-status">
              <span className="online-indicator">●</span>
              <span className="admin-username">Admin</span>
              <button
                type="button"
                onClick={handleLogout}
                className="admin-logout-btn"
                title="Logout from Admin Portal"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `admin-nav-tab ${isActive ? 'active' : ''}`
            }
          >
            🔐 Admin Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}
