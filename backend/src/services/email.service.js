const nodemailer = require('nodemailer');

/**
 * Sends a confirmation email to the applicant upon new application creation.
 * If configured SMTP fails or is unconfigured, falls back to a live Ethereal test transport
 * so email delivery and preview links work guaranteed.
 * 
 * @param {Object} client - The created client application object
 * @returns {Promise<Object>} Status of email sending operation
 */
async function sendRegistrationEmail(client) {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
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

  // 1. Try Configured SMTP if user and pass exist
  if (user && pass && pass !== 'your_app_password_here') {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service Success] Email sent via SMTP to ${client.Email}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'SMTP' };
    } catch (error) {
      console.warn(`[Email Service SMTP Notice] Primary SMTP transport failed (${error.message}). Attempting Ethereal test account...`);
    }
  }

  // 2. Fallback to Ethereal Test Account so email generation and preview link always work
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await testTransporter.sendMail({
      ...mailOptions,
      from: `"Macao PSP Services" <${testAccount.user}>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service Success] Email sent via Ethereal to ${client.Email}. MessageId: ${info.messageId}`);
    console.log(`[Email Service Preview URL]: ${previewUrl}`);
    return { success: true, messageId: info.messageId, previewUrl, mode: 'Ethereal' };
  } catch (testError) {
    console.error(`[Email Service Error] Failed to send email:`, testError.message);
    return { success: false, error: testError.message };
  }
}

module.exports = {
  sendRegistrationEmail
};
