import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api.jsx";
import { addApplication, generateRefNumber } from "../data/applicationsStore";
import "../style/AdminPages.css";

export default function NewApplicationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    referenceNo: generateRefNumber(),
    idType: "passport",
    idNumber: "",
    surname: "",
    givenName: "",
    email: "",
    dob: "",
    placeOfBirth: "",
    category: "Student Visa",
    status: "Under Review",
    submissionDate: new Date().toISOString().split("T")[0],
    effectiveDate: "",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [createdApp, setCreatedApp] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { referenceNo, idNumber, surname, email, dob, placeOfBirth } =
      formData;

    if (
      !idNumber.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !dob ||
      !placeOfBirth.trim()
    ) {
      setErrorMsg(
        "Please fill in all mandatory application fields marked with *.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    setEmailNotice("");

    try {
      // 1. Local Store Backup
      const localCreated = addApplication(formData);
      setCreatedApp(localCreated);

      // 2. Persist to Backend MongoDB + Trigger Nodemailer Email
      const response = await API.post("/clients", {
        referenceNo: formData.referenceNo,
        Category: formData.category,
        FullName: `${formData.surname} ${formData.givenName || ""}`.trim(),
        Email: formData.email,
        PassportNumber: formData.idNumber,
        DOB: formData.dob,
        POB: formData.placeOfBirth,
        Status: formData.status,
        Paragraph:
          formData.remarks ||
          "Currently the status is pending, the application is under review.",
      });

      const data = response.data;

      if (data && data.client) {
        const finalRef = data.client?.referenceNo || localCreated.referenceNo;
        setCreatedApp({ ...localCreated, referenceNo: finalRef });
        setSuccessMsg(
          `Application ${finalRef} successfully registered in database!`,
        );

        if (data.emailSent) {
          if (data.emailDetails?.previewUrl) {
            setEmailNotice(
              <span>
                📧 Confirmation email sent!{" "}
                <a
                  href={data.emailDetails.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "underline",
                    color: "#0284c7",
                    fontWeight: "bold",
                  }}
                >
                  Click to View Email Preview ↗
                </a>
              </span>,
            );
          } else {
            setEmailNotice(
              `📧 Confirmation email with Reference No (${finalRef}) sent to ${formData.email}.`,
            );
          }
        } else {
          setEmailNotice(
            `📧 Application saved in DB. (Email status: ${data.emailDetails?.error || "Pending"}).`,
          );
        }
      } else {
        setSuccessMsg(
          `Application ${localCreated.referenceNo} registered in local store.`,
        );
        setEmailNotice(
          `Backend notice: ${data.message || "Could not connect to backend"}`,
        );
      }
    } catch (err) {
      console.warn("Backend API connection warning:", err.message);
      setSuccessMsg(
        `Application ${formData.referenceNo} registered successfully in store.`,
      );
      setEmailNotice(
        `Note: Saved in local store. Backend server connection error.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      referenceNo: generateRefNumber(),
      idType: "passport",
      idNumber: "",
      surname: "",
      givenName: "",
      email: "",
      dob: "",
      placeOfBirth: "",
      category: "Immigration Non-Resident Workers",
      status: "Under Review",
      submissionDate: new Date().toISOString().split("T")[0],
      effectiveDate: "",
      remarks: "",
    });
    setSuccessMsg("");
    setEmailNotice("");
    setErrorMsg("");
    setCreatedApp(null);
  };

  return (
    <div className="admin-page-container">
      <div className="admin-card">
        <div className="admin-card-header flex-between">
          <div>
            <h2>➕ Register New Application</h2>
            <p className="header-subtitle">
              Create a new official Macao PSP application record in the system
            </p>
          </div>
          <button
            type="button"
            className="btn-admin-outline"
            onClick={() => navigate("/edit-application")}
          >
            📋 Manage Existing Applications
          </button>
        </div>

        <div className="admin-card-body">
          {successMsg && (
            <div className="admin-alert alert-success">
              <span className="alert-icon">✅</span>
              <div>
                <strong>{successMsg}</strong>
                {emailNotice && (
                  <p
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#047857",
                    }}
                  >
                    {emailNotice}
                  </p>
                )}
                <p style={{ marginTop: "4px", fontSize: "13px" }}>
                  The applicant can now check their status using Passport No,
                  Reference No: <code>{createdApp?.referenceNo}</code>, and
                  Email.
                </p>
                <div style={{ marginTop: "8px" }}>
                  <button
                    type="button"
                    className="btn-admin-sm btn-admin-primary"
                    onClick={handleReset}
                  >
                    ➕ Register Another Application
                  </button>
                  &nbsp;
                  <button
                    type="button"
                    className="btn-admin-sm btn-admin-secondary"
                    onClick={() => navigate("/edit-application")}
                  >
                    ✏️ Go to Edit Page
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="admin-alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-section-title">1. Reference & Category</div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label htmlFor="referenceNo">Application Reference No. *</label>
                <input
                  type="text"
                  id="referenceNo"
                  name="referenceNo"
                  className="admin-input font-mono"
                  value={formData.referenceNo}
                  onChange={handleChange}
                  required
                />
                <span className="field-hint">
                  Auto-generated or custom reference code
                </span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="category">Application Category *</label>
                <select
                  id="category"
                  name="category"
                  className="admin-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Student Visa">Student Visa</option>
                  <option value="Study Visa">Study Visa</option>
                  <option value="Work Visa">Work Visa</option>
                  <option value="Tourist Visa">Tourist Visa</option>
                  <option value="Immigration Non-Resident Workers">Immigration Non-Resident Workers</option>
                  <option value="Immigration Stay/Residence">Immigration Stay/Residence</option>
                </select>
              </div>
            </div>

            <div className="form-section-title">
              2. Applicant Personal Identification
            </div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label htmlFor="idType">Identification Type *</label>
                <select
                  id="idType"
                  name="idType"
                  className="admin-select"
                  value={formData.idType}
                  onChange={handleChange}
                >
                  <option value="passport">Passport Number</option>
                  <option value="id_card">Identity Card Number</option>
                  <option value="work_permit">Work Permit Number</option>
                  <option value="app_no">Application Number</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="idNumber">
                  Passport / Identification Number *
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  className="admin-input"
                  placeholder="e.g. A12345678"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label htmlFor="surname">Surname / Family Name *</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  className="admin-input"
                  placeholder="e.g. SMITH"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="givenName">Given Name(s)</label>
                <input
                  type="text"
                  id="givenName"
                  name="givenName"
                  className="admin-input"
                  placeholder="e.g. John Michael"
                  value={formData.givenName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="admin-form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="admin-input"
                  placeholder="e.g. applicant@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="dob">Date of Birth *</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="admin-input"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="placeOfBirth">Place of Birth *</label>
                <input
                  type="text"
                  id="placeOfBirth"
                  name="placeOfBirth"
                  className="admin-input"
                  placeholder="e.g. Macau"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section-title">
              3. Processing Status & Remarks
            </div>

            <div className="form-grid-3">
              <div className="admin-form-group">
                <label htmlFor="status">Application Status *</label>
                <select
                  id="status"
                  name="status"
                  className="admin-select status-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Under Review">Under Review ⏳</option>
                  <option value="Approved">Approved ✅</option>
                  <option value="Pending Documents">
                    Pending Documents 📄
                  </option>
                  <option value="Processing">Processing ⚙️</option>
                  <option value="Rejected">Rejected ❌</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="submissionDate">Submission Date *</label>
                <input
                  type="date"
                  id="submissionDate"
                  name="submissionDate"
                  className="admin-input"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="effectiveDate">Approval / Effective Date</label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  className="admin-input"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="remarks">
                Official Admin Remarks / Internal Notes
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows="3"
                className="admin-textarea"
                placeholder="Add any verification notes or status details for the applicant..."
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn-admin-primary">
                💾 Save & Register Application
              </button>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={handleReset}
              >
                🔄 Clear / Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
