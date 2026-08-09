import React from 'react';
import '../style/Footer.css';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-info">
        <div className="footer-row footer-row-bold">
          Best viewed with IE9.0 or above, 1024 X 768 or higher resolution.
        </div>
        <div className="footer-row">
          ©2010 Government of Macao S.A.R., Public Security Police Force. All rights reserved
        </div>
        <div className="footer-row">
          Address: Avenida do Cais de Pac On, Edifício do Comando do CPSP, Taipa
        </div>
        <div className="footer-row">
          Tel: (853) 2857 3333 Fax: (853) 2878 0826 E-mail: psp-info@fsm.gov.mo
        </div>
      </div>

      <div className="footer-revision-date">
        Last revision date: 7/8/2026
      </div>
    </footer>
  );
}
