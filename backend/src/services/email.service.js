const nodemailer = require('nodemailer');

/**
 * Creates and returns a Nodemailer transporter instance optimized for both local & production (Render/Cloud) environments.
 * 
 * Key production fixes for Render / Cloud deployment:
 * 1. `family: 4` forces IPv4 resolution for smtp.gmail.com (prevents IPv6 connection hanging on Render Linux containers).
 * 2. `pool: true` reuses socket connections instead of handshake overhead on every request.
 * 3. Sanitizes app password (stripping whitespace).
 * 4. `tls: { rejectUnauthorized: false }` prevents certificate/SNI validation errors in container environments.
 */
function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : port === 465;
  const user = process.env.EMAIL_USER;
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  const isGmail = host.includes('gmail') || (!process.env.EMAIL_HOST && user);

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      family: 4, // Force IPv4 connection to prevent Render IPv6 DNS hanging
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    family: 4, // Force IPv4 connection
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
}

let transporter = createTransporter();

/**
 * Verifies Nodemailer SMTP transport connection on backend startup.
 */
async function verifyTransporter() {
  try {
    const user = process.env.EMAIL_USER;
    if (!user) {
      console.warn('[Nodemailer Warning] EMAIL_USER environment variable is missing.');
      return false;
    }
    await transporter.verify();
    console.log(`[Nodemailer Success] SMTP transport verified and ready to send emails (${user})`);
    return true;
  } catch (error) {
    console.error(`[Nodemailer Error] SMTP verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Core function to send an email using Nodemailer.
 * 
 * @param {Object} mailOptions - Options containing recipient, subject, and html content
 * @returns {Promise<Object>} Status of email sending operation
 */
async function sendEmail(mailOptions) {
  const user = process.env.EMAIL_USER;
  const defaultFrom = process.env.EMAIL_FROM || `"Macao PSP Immigration Services" <${user || 'noreply.macau@gmail.com'}>`;

  const finalMailOptions = {
    from: mailOptions.from || defaultFrom,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html
  };

  try {
    console.log(`[Nodemailer] Sending email to ${finalMailOptions.to}...`);
    const info = await transporter.sendMail(finalMailOptions);
    console.log(`[Nodemailer Success] Email sent to ${finalMailOptions.to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, mode: 'Nodemailer' };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send email to ${finalMailOptions.to}: ${error.message}. Retrying once with fresh transport...`);
    
    // Attempt fallback rebuild of transporter once in case pool socket disconnected
    try {
      transporter = createTransporter();
      const retryInfo = await transporter.sendMail(finalMailOptions);
      console.log(`[Nodemailer Success] Retry email sent to ${finalMailOptions.to}. MessageId: ${retryInfo.messageId}`);
      return { success: true, messageId: retryInfo.messageId, mode: 'Nodemailer' };
    } catch (retryError) {
      console.error(`[Nodemailer Error] Retry email sending failed:`, retryError.message);
      return {
        success: false,
        error: `Nodemailer email delivery failed: ${retryError.message}`
      };
    }
  }
}

/**
 * Sends a confirmation email to the applicant upon new application creation.
 * 
 * @param {Object} client - The client application object
 * @returns {Promise<Object>} Status of email sending operation
 */
async function sendRegistrationEmail(client) {
  const user = process.env.EMAIL_USER;
  const from = process.env.EMAIL_FROM || `"Macao PSP Services" <${user || 'noreply.macau@gmail.com'}>`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0056b3; margin: 0;">Macao Public Security Police Force</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Client Application Confirmation</p>
      </div>

      <p style="font-size: 16px; color: #1e293b;">Dear <strong>${client.FullName}</strong>,</p>
      
      <p style="font-size: 15px; color: #334155; line-height: 1.5;">
        Your application for <strong>${client.Category}</strong> has been successfully registered in the system database.
      </p>

      <div style="background-color: #f1f5f9; border-left: 4px solid #0056b3; border-radius: 4px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a;">Application Reference Details</h4>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Reference Number:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #0056b3; background: #e0f2fe; padding: 2px 8px; border-radius: 4px;">${client.referenceNo}</span>
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Passport / Identification No:</strong> ${client.PassportNumber}
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Registered Email:</strong> ${client.Email}
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Current Status:</strong> <span style="color: #d97706; font-weight: bold;">${client.Status || 'Pending'}</span>
        </p>
      </div>

      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.4;">
          📌 <strong>Important Notice for Checking Status:</strong><br/>
          To check the progress of your application online, you will need to provide all 3 required fields:<br/>
          1. Your Passport / ID Number<br/>
          2. Your Reference Number (<code>${client.referenceNo}</code>)<br/>
          3. Your Registered Email Address (<code>${client.Email}</code>)
        </p>
      </div>

      <p style="font-size: 14px; color: #64748b;">
        If you have any questions or require further assistance, please contact official support.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        This is an automated notification. Please do not reply directly to this email.
      </p>
    </div>
  `;

  const mailOptions = {
    from,
    to: client.Email,
    subject: `Application Registered - Reference No: ${client.referenceNo}`,
    html: htmlContent
  };

  return await sendEmail(mailOptions);
}

/**
 * Sends an email notification when an application status/details are updated by Admin.
 * 
 * @param {Object} client - The updated client application object
 * @returns {Promise<Object>} Status of email sending operation
 */
async function sendStatusUpdateEmail(client) {
  if (!client || !client.Email) {
    return { success: false, error: 'No recipient email provided' };
  }

  const user = process.env.EMAIL_USER;
  const from = process.env.EMAIL_FROM || `"Macao PSP Services" <${user || 'noreply.macau@gmail.com'}>`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0056b3; margin: 0;">Macao Public Security Police Force</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Application Status Update Notification</p>
      </div>

      <p style="font-size: 16px; color: #1e293b;">Dear <strong>${client.FullName}</strong>,</p>
      
      <p style="font-size: 15px; color: #334155; line-height: 1.5;">
        The status of your application for <strong>${client.Category}</strong> has been updated.
      </p>

      <div style="background-color: #f1f5f9; border-left: 4px solid #0056b3; border-radius: 4px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a;">Updated Application Details</h4>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Reference Number:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #0056b3; background: #e0f2fe; padding: 2px 8px; border-radius: 4px;">${client.referenceNo}</span>
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Passport / Identification No:</strong> ${client.PassportNumber}
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>New Status:</strong> <span style="color: #0056b3; font-weight: bold;">${client.Status || 'Under Review'}</span>
        </p>
        ${client.Paragraph ? `
        <p style="margin: 8px 0 4px 0; font-size: 14px; color: #334155;">
          <strong>Official Remarks:</strong><br/>
          <em style="color: #475569;">"${client.Paragraph}"</em>
        </p>` : ''}
      </div>

      <p style="font-size: 14px; color: #64748b;">
        You can verify this update online anytime by providing your Passport No, Reference No, and Registered Email.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        This is an automated notification from Macao PSP Immigration Services.
      </p>
    </div>
  `;

  const mailOptions = {
    from,
    to: client.Email,
    subject: `Application Status Update - Reference No: ${client.referenceNo} (${client.Status})`,
    html: htmlContent
  };

  return await sendEmail(mailOptions);
}

module.exports = {
  sendRegistrationEmail,
  sendStatusUpdateEmail,
  verifyTransporter
};


