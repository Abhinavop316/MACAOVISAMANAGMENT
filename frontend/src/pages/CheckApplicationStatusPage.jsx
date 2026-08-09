import React from 'react';
import { useNavigate } from 'react-router-dom';
import SystemList from '../components/SystemList';
import CheckApplication from '../components/checkApplicationStatus';
import { systemServices } from '../data/systemServicesData';

export default function CheckApplicationStatusPage() {
  const navigate = useNavigate();

  const handleContinueToStatus = () => {
    navigate('/status-check');
  };

  const handleCancel = () => {
    navigate('/check-application-status');
  };

  return (
    <div>
      {/* System Services Cards list displayed only on /check-application-status page */}
      <SystemList services={systemServices} />

      {/* CheckApplication Terms and Conditions component appended at the bottom */}
      <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #e2e8f0' }}>
        <CheckApplication 
          onContinue={handleContinueToStatus} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
}
