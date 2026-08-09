import React, { useState } from "react";
import "../style/CheckApplication.css";

export default function CheckApplication({ onContinue, onCancel }) {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (agreed && onContinue) {
      onContinue();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="check-app-container">
      {/* Title section with blue arrow matching CPSP system titles */}
      <div className="check-app-title-row">
        <div className="check-app-blue-arrow">➡️</div>
        <h1 className="check-app-title">Client Application Status</h1>
      </div>
      <hr className="check-app-header-line" />

      {/* Sub-heading */}
      <h2 className="check-app-section-title">Security</h2>

      {/* Main Card with Terms & Conditions */}
      <div className="check-app-card">
        <div className="check-app-card-heading">Terms and Conditions</div>

        <div className="check-app-content-group">
          {/* Certification of Authority */}
          <div>
            <div className="check-app-subheading">
              Certification of Authority for the Client Service
            </div>
            <p className="check-app-paragraph">
              Using this on-line service means that you confirm that you are the
              applicant, applicant's executor, legal guardian, authorized
              officer, or agent of the person for whom this application was
              submitted.
            </p>
          </div>

          {/* Security for this Service */}
          <div>
            <div className="check-app-subheading">
              Security for this Service
            </div>
            <ul className="check-app-bullets">
              <li className="check-app-bullet-item">
                Immigration, Refugees and Citizenship Canada is committed to
                respecting the personal privacy of individuals who visit our Web
                site. All personal information you provide is protected under
                the Government of Canada <em>Federal Privacy Act</em>.
              </li>
              <li className="check-app-bullet-item">
                Information on this site is sent between your computer and our
                servers in an encrypted format.
              </li>
              <li className="check-app-bullet-item">
                We use Secure Sockets Layer (also known as SSL) protocol with
                128-bit encryption that enhances the privacy of the information
                passing between your browser and our servers.
              </li>
            </ul>
          </div>

          {/* Important section */}
          <div>
            <div className="check-app-important-title">Important:</div>
            <ol
              className="check-app-important-list"
              style={{ paddingLeft: "20px" }}
            >
              <li>
                Client security is important to us. Please visit our browser
                information section.
              </li>
              <li>
                Keep your identification number(s) confidential to make sure
                that others cannot view your application status.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Checkbox agreement row */}
      <div className="check-app-agreement-box">
        <input
          type="checkbox"
          id="terms-agreement"
          className="check-app-checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="terms-agreement" className="check-app-checkbox-label">
          I have read, understood and agree with the above Terms and Conditions.
        </label>
      </div>

      {/* Continue and Cancel action buttons */}
      <div className="check-app-actions">
        <button
          className="check-app-btn-continue"
          disabled={!agreed}
          onClick={handleContinue}
        >
          Continue
        </button>
        <button className="check-app-btn-cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
