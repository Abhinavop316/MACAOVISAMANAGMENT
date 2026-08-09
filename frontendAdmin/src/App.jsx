import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';

import AdminLoginPage from './pages/AdminLoginPage';
import NewApplicationPage from './pages/NewApplicationPage';
import EditApplicationPage from './pages/EditApplicationPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        {/* Top Header Banner */}
        <Header bannerSrc="/banner.jpg" />

        {/* Admin Navigation Bar */}
        <AdminNavbar />

        {/* Main Admin Section */}
        <div className="content-body-row">
          <main className="system-list-container full-width-admin" aria-label="Admin Management Body">
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/new-application" replace />} />

              {/* Admin Login Page */}
              <Route path="/login" element={<AdminLoginPage />} />

              {/* Protected Page: New Application */}
              <Route
                path="/new-application"
                element={
                  <ProtectedRoute>
                    <NewApplicationPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Page: Edit Application */}
              <Route
                path="/edit-application"
                element={
                  <ProtectedRoute>
                    <EditApplicationPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback wildcard route */}
              <Route path="*" element={<Navigate to="/new-application" replace />} />
            </Routes>
          </main>
        </div>

        {/* Bottom Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
