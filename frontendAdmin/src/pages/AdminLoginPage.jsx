import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/AdminPages.css';

export default function AdminLoginPage() {
  const { isLoggedIn, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/new-application';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(result.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('An error occurred during authentication.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="admin-page-container">
        <div className="admin-card text-center">
          <div className="admin-card-header">
            <h2>🛡️ Admin Portal - Already Authenticated</h2>
          </div>
          <div className="admin-card-body">
            <p className="admin-welcome-text">
              You are currently logged in as <strong>Admin</strong>.
            </p>
            <div className="admin-btn-row center">
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => navigate('/new-application')}
              >
                ➕ Create New Application
              </button>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => navigate('/edit-application')}
              >
                ✏️ Edit Existing Application
              </button>
              <button
                type="button"
                className="btn-admin-danger"
                onClick={() => {
                  logout();
                  setErrorMsg('');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-card login-card">
        <div className="admin-card-header">
          <div className="header-icon-title">
            <span className="lock-icon">🔒</span>
            <h2>Admin Portal Access</h2>
          </div>
          <p className="header-subtitle">
            Corpo de Polícia de Segurança Pública - System Administrator Login
          </p>
        </div>

        <div className="admin-card-body">
          {errorMsg && (
            <div className="admin-alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="admin-info-banner">
            <span className="info-icon">ℹ️</span>
            <div>
              <strong>Default Admin Credentials:</strong><br />
              Username: <code className="code-badge">admin</code> &nbsp;|&nbsp;
              Password: <code className="code-badge">admin123</code>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-group">
              <label htmlFor="adminUsername">Admin Username</label>
              <input
                type="text"
                id="adminUsername"
                name="adminUsername"
                className="admin-input"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="adminPassword">Admin Password</label>
              <input
                type="password"
                id="adminPassword"
                name="adminPassword"
                className="admin-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn-admin-primary btn-block" disabled={isLoggingIn}>
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
