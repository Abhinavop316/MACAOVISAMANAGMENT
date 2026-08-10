import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api.jsx';
import {
  getApplications,
  updateApplication,
  deleteApplication
} from '../data/applicationsStore';
import '../style/AdminPages.css';

export default function EditApplicationPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const [editForm, setEditForm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadApps = async () => {
    try {
      const response = await API.get('/clients');
      const dbClients = response.data;
      if (Array.isArray(dbClients)) {
        const mappedDb = dbClients.map((c, idx) => {
          let ref = (c.referenceNo || '').trim();
          if (!ref) {
            const shortHash = c._id ? String(c._id).slice(-6).toUpperCase() : `${100000 + idx}`;
            ref = `2026-${shortHash}`;
          }
          return {
            id: c._id || ref,
            mongoId: c._id,
            referenceNo: ref,
            idType: 'passport',
            idNumber: c.PassportNumber || 'N/A',
            email: c.Email || 'N/A',
            surname: c.FullName || 'N/A',
            givenName: '',
            dob: c.DOB ? new Date(c.DOB).toISOString().split('T')[0] : '',
            placeOfBirth: c.POB || 'Macau',
            category: c.Category || 'Tourist Visa',
            status: c.Status || 'Pending',
            submissionDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            effectiveDate: '',
            remarks: c.Paragraph || ''
          };
        });

        setApplications(mappedDb);
        return;
      }
    } catch (e) {
      console.warn('Could not fetch applications from backend DB:', e.message);
    }
    setApplications([]);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleSelectForEdit = (app) => {
    setSelectedApp(app);
    setEditForm({ ...app });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editForm || !selectedApp) return;

    if (!editForm.idNumber || !editForm.surname || !editForm.email) {
      setErrorMsg('Mandatory fields (ID Number, Name, Email) cannot be empty.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // Local store update
      const updated = updateApplication(selectedApp.id, editForm);

      // Backend DB update if mongoId is present
      if (selectedApp.mongoId) {
        await API.put(`/clients/${selectedApp.mongoId}`, {
          referenceNo: editForm.referenceNo,
          PassportNumber: editForm.idNumber,
          FullName: `${editForm.givenName ? `${editForm.givenName} ` : ''}${editForm.surname}`.trim(),
          Email: editForm.email,
          Category: editForm.category,
          Status: editForm.status,
          Paragraph: editForm.remarks
        });
      }

      setSuccessMsg(`Application ${editForm.referenceNo} updated successfully!`);
      setErrorMsg('');
      loadApps();
      setSelectedApp({ ...selectedApp, ...editForm });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Error updating application.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id, refNo) => {
    if (window.confirm(`Are you sure you want to delete Application ${refNo}?`)) {
      deleteApplication(id);
      if (selectedApp?.mongoId) {
        try {
          await API.delete(`/clients/${selectedApp.mongoId}`);
        } catch (e) {
          console.warn('Error deleting from backend DB:', e.message);
        }
      }
      setSuccessMsg(`Application ${refNo} deleted successfully.`);
      setSelectedApp(null);
      setEditForm(null);
      loadApps();
    }
  };

  const [showAll, setShowAll] = useState(false);

  // Filter apps by either Passport Number OR Reference Number (or Name / Email / Status)
  const hasSearch = searchTerm.trim().length > 0;

  const filteredApps = applications.filter((app) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return showAll;
    return (
      (app.referenceNo && app.referenceNo.toLowerCase().includes(query)) ||
      (app.idNumber && app.idNumber.toLowerCase().includes(query)) ||
      (app.surname && app.surname.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query)) ||
      (app.status && app.status.toLowerCase().includes(query))
    );
  });

  return (
    <div className="admin-page-container">
      <div className="admin-card">
        <div className="admin-card-header flex-between">
          <div>
            <h2>✏️ Edit & Manage Applications</h2>
            <p className="header-subtitle">
              Search by Passport No. or Reference No. to view, edit, or remove application records
            </p>
          </div>
          <button
            type="button"
            className="btn-admin-primary"
            onClick={() => navigate('/new-application')}
          >
            ➕ Register New Application
          </button>
        </div>

        <div className="admin-card-body">
          {successMsg && (
            <div className="admin-alert alert-success">
              <span className="alert-icon">✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="admin-alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Filter Bar */}
          <div className="search-filter-box">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="admin-input search-field"
                placeholder="Type Passport No. or Reference No. to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-admin-secondary btn-admin-sm"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? '🙈 Hide All' : '👁️ Show All Records'}
              </button>

              <div className="count-badge">
                {hasSearch || showAll ? `Found: ${filteredApps.length}` : 'Search Required'}
              </div>
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref No.</th>
                  <th>Applicant Name</th>
                  <th>ID Number</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Sub. Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center no-data" style={{ padding: '36px 16px' }}>
                      {!hasSearch && !showAll ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.8rem' }}>🔍</span>
                          <span style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '0.95rem' }}>
                            Please enter a Passport Number or Reference Number above to search for records.
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            (You can search by Passport No., Reference No., Applicant Name, or Email)
                          </span>
                        </div>
                      ) : (
                        <span>No matching application records found for your search query.</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    return (
                      <tr
                        key={app.id}
                        className={isSelected ? 'row-selected' : ''}
                      >
                        <td className="font-mono font-bold">{app.referenceNo}</td>
                        <td>{app.givenName ? `${app.givenName} ${app.surname}` : app.surname}</td>
                        <td>
                          <span className="id-badge">{app.idType}</span> {app.idNumber}
                        </td>
                        <td className="small-text">{app.category}</td>
                        <td>
                          <span className={`status-pill status-${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>{app.submissionDate}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-admin-sm btn-admin-primary"
                            onClick={() => handleSelectForEdit(app)}
                          >
                            Edit ✏️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Application Form Panel */}
          {selectedApp && editForm && (
            <div className="edit-panel-container" id="edit-form-panel">
              <div className="edit-panel-header">
                <h3>Editing Application: <code className="code-highlight">{selectedApp.referenceNo}</code></h3>
                <button
                  type="button"
                  className="close-panel-btn"
                  onClick={() => {
                    setSelectedApp(null);
                    setEditForm(null);
                  }}
                >
                  ✕ Close Edit Mode
                </button>
              </div>

              <form onSubmit={handleSaveUpdate} className="admin-form">
                <div className="form-grid-3">
                  <div className="admin-form-group">
                    <label htmlFor="editRefNo">Reference Number</label>
                    <input
                      type="text"
                      id="editRefNo"
                      name="referenceNo"
                      className="admin-input font-mono"
                      value={editForm.referenceNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="editStatus">Status *</label>
                    <select
                      id="editStatus"
                      name="status"
                      className="admin-select status-select"
                      value={editForm.status}
                      onChange={handleFormChange}
                    >
                      <option value="Under Review">Under Review ⏳</option>
                      <option value="Approved">Approved ✅</option>
                      <option value="Pending Documents">Pending Documents 📄</option>
                      <option value="Processing">Processing ⚙️</option>
                      <option value="Rejected">Rejected ❌</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="editCategory">Category</label>
                    <select
                      id="editCategory"
                      name="category"
                      className="admin-select"
                      value={editForm.category}
                      onChange={handleFormChange}
                    >
                      <option value="Student Visa">Student Visa</option>
                      <option value="Study Visa">Study Visa</option>
                      <option value="Work Visa">Work Visa</option>
                      <option value="Tourist Visa">Tourist Visa</option>
                      <option value="Immigration Non-Resident Workers">Immigration Non-Resident Workers</option>
                      <option value="Immigration Stay/Residence">Immigration Stay/Residence</option>
                      <option value="Traffic Affairs">Traffic Affairs</option>
                      <option value="Immigration Other">Immigration Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="admin-form-group">
                    <label htmlFor="editIdType">Identification Type</label>
                    <select
                      id="editIdType"
                      name="idType"
                      className="admin-select"
                      value={editForm.idType}
                      onChange={handleFormChange}
                    >
                      <option value="passport">Passport Number</option>
                      <option value="id_card">Identity Card Number</option>
                      <option value="work_permit">Work Permit Number</option>
                      <option value="app_no">Application Number</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="editIdNumber">ID / Passport Number</label>
                    <input
                      type="text"
                      id="editIdNumber"
                      name="idNumber"
                      className="admin-input"
                      value={editForm.idNumber}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="editEmail">Email Address</label>
                    <input
                      type="email"
                      id="editEmail"
                      name="email"
                      className="admin-input"
                      value={editForm.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="admin-form-group">
                    <label htmlFor="editGivenName">Given Name(s)</label>
                    <input
                      type="text"
                      id="editGivenName"
                      name="givenName"
                      className="admin-input"
                      value={editForm.givenName || ''}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="editSurname">Surname / Family Name</label>
                    <input
                      type="text"
                      id="editSurname"
                      name="surname"
                      className="admin-input"
                      value={editForm.surname}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="editDob">Date of Birth</label>
                    <input
                      type="date"
                      id="editDob"
                      name="dob"
                      className="admin-input"
                      value={editForm.dob}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="editPlaceOfBirth">Place of Birth</label>
                  <input
                    type="text"
                    id="editPlaceOfBirth"
                    name="placeOfBirth"
                    className="admin-input"
                    value={editForm.placeOfBirth}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="editRemarks">Official Admin Remarks / Notes</label>
                  <textarea
                    id="editRemarks"
                    name="remarks"
                    rows="3"
                    className="admin-textarea"
                    value={editForm.remarks || ''}
                    onChange={handleFormChange}
                  ></textarea>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="btn-admin-primary">
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-admin-danger"
                    onClick={() => handleDelete(selectedApp.id, selectedApp.referenceNo)}
                  >
                    🗑️ Delete Application
                  </button>
                  <button
                    type="button"
                    className="btn-admin-secondary"
                    onClick={() => {
                      setSelectedApp(null);
                      setEditForm(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
