/**
 * Email Service
 * Sends resume files via Nodemailer SMTP.
 */
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send resume export files as email attachments.
 */
async function sendResumeEmail(recipientEmail, recipientName, docxPath, pdfPath) {
  const transporter = createTransporter();

  const attachments = [];

  if (docxPath && fs.existsSync(docxPath)) {
    attachments.push({
      filename: `${recipientName || 'Resume'}.docx`,
      path: docxPath,
    });
  }

  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `${recipientName || 'Resume'}.pdf`,
      path: pdfPath,
    });
  }

  if (attachments.length === 0) {
    throw new Error('No export files found to send');
  }

  const mailOptions = {
    from: `"AI Resume Builder" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `Your Optimized Resume — ${recipientName || 'Download'}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Your Resume is Ready! 🎉</h2>
        <p>Hi ${recipientName || 'there'},</p>
        <p>Your AI-optimized resume is attached in both DOCX and PDF formats.</p>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
          Sent from <strong>AI Resume Builder</strong>
        </p>
      </div>
    `,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendResumeEmail };
