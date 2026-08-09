import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import SubNavTabs from './components/SubNavTabs';
import Sidebar from './components/Sidebar';
import CheckApplicationStatusPage from './pages/CheckApplicationStatusPage';
import StatusCheckPage from './pages/StatusCheckPage';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [activeSubTab, setActiveSubTab] = useState('Immigration Non-Resident Workers');

  return (
    <div className="app-wrapper">
      {/* Top Header & Header Banner Image */}
      <Header bannerSrc="/banner.jpg" />

      {/* Main Navigation Bar */}
      <Navbar activeNav="Services/Formalities" />

      {/* Sub Navigation Breadcrumb and Sub-Tabs */}
      <SubNavTabs 
        activeSubTab={activeSubTab} 
        onTabChange={(tabId) => setActiveSubTab(tabId)} 
      />

      {/* Main Content Area with 2 Columns */}
      <div className="content-body-row">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Main Section managed by Page Routes */}
        <main className="system-list-container" aria-label="Immigration Non-Resident Workers Services">
          <Routes>
            <Route 
              path="/" 
              element={<Navigate to="/check-application-status" replace />} 
            />
            <Route 
              path="/check-application-status" 
              element={<CheckApplicationStatusPage />} 
            />
            <Route 
              path="/status-check" 
              element={<StatusCheckPage />} 
            />
          </Routes>
        </main>
      </div>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}

export default App;
