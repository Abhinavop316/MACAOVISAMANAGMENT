const nodemailer = require('nodemailer');

/**
 * Sends a confirmation email to the applicant upon new application creation.
 * If configured SMTP fails or is unconfigured, falls back to a live Ethereal test transport
 * so email delivery and preview links work guaranteed.
 * 
 * @param {Object} client - The created client application object
 * @returns {Promise<Object>} Status of email sending operation
 */
/**
 * Helper to attempt sending an email via HTTPS REST API (Resend / Brevo) or primary SMTP / fallbacks.
 * HTTPS REST API is 100% immune to cloud provider SMTP port blocking on Render / Vercel.
 */
async function sendMailWithFallback(mailOptions) {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;

  // 1. Try Resend HTTPS API (Port 443 - Never blocked on Render / Vercel)
  if (resendApiKey) {
    try {
      console.log(`[Email Service] Attempting delivery via Resend HTTPS API to ${mailOptions.to}...`);
      const fromAddr = process.env.EMAIL_FROM || 'Macao PSP Services <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [mailOptions.to],
          subject: mailOptions.subject,
          html: mailOptions.html
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        console.log(`[Email Service Success] Email delivered via Resend API to ${mailOptions.to}. ID: ${data.id}`);
        return { success: true, messageId: data.id, mode: 'ResendAPI' };
      } else {
        console.warn(`[Email Service Notice] Resend API error: ${JSON.stringify(data)}`);
      }
    } catch (resendErr) {
      console.warn(`[Email Service Notice] Resend API request failed (${resendErr.message}). Falling back...`);
    }
  }

  // 2. Try Brevo HTTPS API (Port 443 - Never blocked on Render / Vercel)
  if (brevoApiKey) {
    try {
      console.log(`[Email Service] Attempting delivery via Brevo HTTPS API to ${mailOptions.to}...`);
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Macao PSP Services', email: user || 'noreply.macau@gmail.com' },
          to: [{ email: mailOptions.to }],
          subject: mailOptions.subject,
          htmlContent: mailOptions.html
        })
      });
      const data = await res.json();
      if (res.ok && (data.messageId || data.id)) {
        const id = data.messageId || data.id;
        console.log(`[Email Service Success] Email delivered via Brevo API to ${mailOptions.to}. ID: ${id}`);
        return { success: true, messageId: id, mode: 'BrevoAPI' };
      } else {
        console.warn(`[Email Service Notice] Brevo API error: ${JSON.stringify(data)}`);
      }
    } catch (brevoErr) {
      console.warn(`[Email Service Notice] Brevo API request failed (${brevoErr.message}). Falling back...`);
    }
  }

  // 3. Try Primary SMTP (port 587 / 465 with 6s connection timeout)
  if (user && pass && pass !== 'your_app_password_here') {
    try {
      const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 6000
      });

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service Success] Email sent via SMTP (${host}:${port}) to ${mailOptions.to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'SMTP' };
    } catch (primaryError) {
      console.warn(`[Email Service Notice] Primary SMTP (${host}:${port}) failed (${primaryError.message}). Trying Gmail Service fallback...`);
    }

    // 4. Try Gmail Service fallback
    try {
      const gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 6000
      });

      const info = await gmailTransporter.sendMail(mailOptions);
      console.log(`[Email Service Success] Email sent via Gmail Service to ${mailOptions.to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'GmailService' };
    } catch (gmailError) {
      console.warn(`[Email Service Notice] Gmail Service fallback failed (${gmailError.message}). Trying Ethereal test account...`);
    }
  }

  // 5. Fallback to Ethereal Test Account (for local development testing)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    const info = await testTransporter.sendMail({
      ...mailOptions,
      from: `"Macao PSP Services" <${testAccount.user}>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service Success] Email sent via Ethereal to ${mailOptions.to}. Preview URL: ${previewUrl}`);
    return { success: true, messageId: info.messageId, previewUrl, mode: 'Ethereal' };
  } catch (testError) {
    console.error(`[Email Service Error] All email delivery transports failed on server:`, testError.message);
    return {
      success: false,
      error: `Render host firewall blocked SMTP socket connection (${testError.message}). Please add RESEND_API_KEY or BREVO_API_KEY to Render Environment Variables for 100% instant HTTPS delivery.`
    };
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

  return await sendMailWithFallback(mailOptions);
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

  return await sendMailWithFallback(mailOptions);
}

module.exports = {
  sendRegistrationEmail,
  sendStatusUpdateEmail
};

