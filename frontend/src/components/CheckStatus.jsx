import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api.jsx';
import '../style/CheckStatus.css';

export default function CheckStatus() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    idType: 'passport',
    idNumber: '',
    referenceNo: '',
    email: '',
    surname: '',
    dob: '',
    placeOfBirth: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [appResult, setAppResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { idNumber, referenceNo, email } = formData;

    // Require ALL 3 parameters
    if (!idNumber.trim() || !referenceNo.trim() || !email.trim()) {
      setErrorMsg('Mandatory requirement: You must provide Passport Number + Reference Number + Registered Email Address.');
      setAppResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setAppResult(null);

    try {
      // 1. Fetch status from backend database using Axios API instance
      const response = await API.post('/get-client', {
        PassportNumber: idNumber.trim(),
        referenceNo: referenceNo.trim(),
        Email: email.trim()
      });

      const data = response.data;

      if (data) {
        setAppResult(data);
      } else {
        // Fallback: search local storage backup if available
        const localData = localStorage.getItem('macao_applications');
        if (localData) {
          const apps = JSON.parse(localData);
          const found = apps.find(
            (app) =>
              (app.idNumber || app.PassportNumber || '').toLowerCase().trim() === idNumber.toLowerCase().trim() &&
              (app.referenceNo || '').toLowerCase().trim() === referenceNo.toLowerCase().trim() &&
              (app.email || app.Email || '').toLowerCase().trim() === email.toLowerCase().trim()
          );
          if (found) {
            setAppResult(found);
            setIsLoading(false);
            return;
          }
        }
        setErrorMsg(data.message || 'No application found matching your Passport Number, Reference Number, and Email Address.');
      }
    } catch (err) {
      console.warn('Backend search error, checking local store:', err.message);
      // Local backup check
      const localData = localStorage.getItem('macao_applications');
      if (localData) {
        const apps = JSON.parse(localData);
        const found = apps.find(
          (app) =>
            (app.idNumber || app.PassportNumber || '').toLowerCase().trim() === idNumber.toLowerCase().trim() &&
            (app.referenceNo || '').toLowerCase().trim() === referenceNo.toLowerCase().trim() &&
            (app.email || app.Email || '').toLowerCase().trim() === email.toLowerCase().trim()
        );
        if (found) {
          setAppResult(found);
          setIsLoading(false);
          return;
        }
      }
      setErrorMsg('No application record found matching all 3 credentials (Passport No + Ref No + Email).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/check-application-status');
  };

  return (
    <div className="check-status-container">
      {/* Title Header with blue arrow */}
      <div className="check-status-title-row">
        <div className="check-status-blue-arrow">➡️</div>
        <h1 className="check-status-title">Client Application Status Search</h1>
      </div>
      <hr className="check-status-header-line" />

      {/* Error banner */}
      {errorMsg && (
        <div className="check-status-error-banner">
          <div className="check-status-error-icon">!</div>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Information Callout */}
      <div className="check-status-callout">
        <span className="check-status-info-badge">i</span>
        <div>
          To search for your application status, you must enter all 3 mandatory credentials: 
          <strong> Passport Number + Application Reference Number + Registered Email Address</strong>.
        </div>
      </div>

      {/* Result Display Box */}
      {appResult && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '2px solid #0284c7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, color: '#0369a1', fontSize: '18px' }}>
              📋 Application Record: <code style={{ backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>{appResult.referenceNo}</code>
            </h3>
            <span style={{
              backgroundColor: appResult.Status === 'Approved' ? '#dcfce7' : '#fef3c7',
              color: appResult.Status === 'Approved' ? '#15803d' : '#b45309',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {appResult.Status || appResult.status || 'Pending'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', color: '#334155' }}>
            <div><strong>Applicant Name:</strong> {appResult.FullName || `${appResult.givenName || ''} ${appResult.surname || ''}`.trim()}</div>
            <div><strong>Passport Number:</strong> {appResult.PassportNumber || appResult.idNumber}</div>
            <div><strong>Email Address:</strong> {appResult.Email || appResult.email}</div>
            <div><strong>Category:</strong> {appResult.Category || appResult.category}</div>
            <div><strong>Date of Birth:</strong> {appResult.DOB ? new Date(appResult.DOB).toLocaleDateString() : appResult.dob || 'N/A'}</div>
            <div><strong>Place of Birth:</strong> {appResult.POB || appResult.placeOfBirth || 'Macau'}</div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
            <strong style={{ color: '#0f172a' }}>Official Status Message / Remarks:</strong>
            <p style={{ margin: '6px 0 0 0', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
              {appResult.Paragraph || appResult.remarks || 'Your application is currently under review by the immigration authority.'}
            </p>
          </div>
        </div>
      )}

      {/* Status Checking Form */}
      <form onSubmit={handleSubmit} className="check-status-form">
        {/* Field 1: Identification Type */}
        <div className="form-row">
          <label htmlFor="idType" className="form-label">
            Identification Type:
          </label>
          <div className="form-input-container">
            <select
              id="idType"
              name="idType"
              className="form-control"
              value={formData.idType}
              onChange={handleChange}
            >
              <option value="passport">Passport Number</option>
              <option value="id_card">Identity Card Number</option>
              <option value="work_permit">Work Permit Number</option>
              <option value="app_no">Application Number</option>
            </select>
          </div>
          <a href="#help" className="help-link">Help</a>
        </div>

        {/* Field 2: Passport / Identification Number (Mandatory) */}
        <div className="form-row">
          <label htmlFor="idNumber" className="form-label">
            Passport / Identification Number * :
          </label>
          <div className="form-input-container">
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              className="form-control"
              placeholder="e.g. A12345678"
              value={formData.idNumber}
              onChange={handleChange}
              required
            />
          </div>
          <a href="#help" className="help-link">Help</a>
        </div>

        {/* Field 3: Application Reference Number (Mandatory: YYYY-XXXXXX) */}
        <div className="form-row">
          <label htmlFor="referenceNo" className="form-label">
            Application Reference Number * :
          </label>
          <div className="form-input-container">
            <input
              type="text"
              id="referenceNo"
              name="referenceNo"
              className="form-control"
              placeholder="e.g. 2026-123456"
              value={formData.referenceNo}
              onChange={handleChange}
              required
            />
          </div>
          <a href="#help" className="help-link">Help</a>
        </div>

        {/* Field 4: Email Address (Mandatory) */}
        <div className="form-row">
          <label htmlFor="email" className="form-label">
            Registered Email Address * :
          </label>
          <div className="form-input-container">
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="e.g. applicant@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="check-status-callout" style={{ marginTop: '8px', marginBottom: '8px' }}>
          <span className="check-status-info-badge">i</span>
          <div>
            Please enter your information as it appears on your application or identity document.
          </div>
        </div>

        {/* Field 5: Surname/Family Name */}
        <div className="form-row">
          <label htmlFor="surname" className="form-label">
            Surname/Family Name:
          </label>
          <div className="form-input-container">
            <input
              type="text"
              id="surname"
              name="surname"
              className="form-control"
              placeholder="As shown on your official document"
              value={formData.surname}
              onChange={handleChange}
            />
          </div>
          <a href="#help" className="help-link">Help</a>
        </div>

        {/* Field 6: Date of Birth */}
        <div className="form-row">
          <label htmlFor="dob" className="form-label">
            Date of Birth:
          </label>
          <div className="form-input-container">
            <input
              type="date"
              id="dob"
              name="dob"
              className="form-control"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
          <a href="#help" className="help-link">Help</a>
        </div>

        {/* Field 7: Place of Birth */}
        <div className="form-row">
          <label htmlFor="placeOfBirth" className="form-label">
            Place of Birth:
          </label>
          <div className="form-input-container">
            <input
              type="text"
              id="placeOfBirth"
              name="placeOfBirth"
              className="form-control"
              placeholder="Country or City of birth"
              value={formData.placeOfBirth}
              onChange={handleChange}
            />
          </div>
          <a href="#help" className="help-link">Help</a>
        </div>

        {/* Action Buttons */}
        <div className="check-status-actions">
          <button type="submit" className="btn-continue-submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Continue'}
          </button>
          <button type="button" className="btn-back-cancel" onClick={handleBack}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
