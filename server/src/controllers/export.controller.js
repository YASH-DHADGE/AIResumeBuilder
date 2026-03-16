/**
 * Export Controller — DOCX, PDF generation and Email sending
 */
const path = require('path');
const Resume = require('../models/Resume.model');
const { generateDocx, generatePdf } = require('../services/export.service');
const { sendResumeEmail } = require('../services/email.service');

/**
 * POST /api/export/:id/docx
 */
async function exportDocx(req, res) {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
      data: null,
    });
  }

  try {
    const docxPath = await generateDocx(resume._id.toString(), resume.sections);
    resume.exportedDocxPath = docxPath;
    await resume.save();

    res.download(docxPath, `${resume.sections.personalInfo?.name || 'Resume'}.docx`);
  } catch (err) {
    console.error('DOCX export error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate DOCX',
      data: null,
    });
  }
}

/**
 * POST /api/export/:id/pdf
 */
async function exportPdf(req, res) {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
      data: null,
    });
  }

  try {
    const pdfPath = await generatePdf(resume._id.toString(), resume.sections);
    resume.exportedPdfPath = pdfPath;
    await resume.save();

    res.download(pdfPath, `${resume.sections.personalInfo?.name || 'Resume'}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      data: null,
    });
  }
}

/**
 * POST /api/export/:id/email
 */
async function exportEmail(req, res) {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
      data: null,
    });
  }

  // Generate files if they don't exist
  let docxPath = resume.exportedDocxPath;
  let pdfPath = resume.exportedPdfPath;

  try {
    if (!docxPath) {
      docxPath = await generateDocx(resume._id.toString(), resume.sections);
      resume.exportedDocxPath = docxPath;
    }
    if (!pdfPath) {
      pdfPath = await generatePdf(resume._id.toString(), resume.sections);
      resume.exportedPdfPath = pdfPath;
    }
    await resume.save();
  } catch (err) {
    console.error('Export generation error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate export files',
      data: null,
    });
  }

  const recipientEmail = req.body.email || req.user.email;
  const recipientName = resume.sections.personalInfo?.name || req.user.name;

  try {
    await sendResumeEmail(recipientEmail, recipientName, docxPath, pdfPath);
  } catch (err) {
    console.error('Email send error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email. Please check SMTP settings.',
      data: null,
    });
  }

  res.json({
    success: true,
    message: `Resume sent to ${recipientEmail}`,
    data: null,
  });
}

module.exports = { exportDocx, exportPdf, exportEmail };
