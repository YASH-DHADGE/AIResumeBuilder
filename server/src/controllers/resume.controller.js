/**
 * Resume Controller — Upload, Fetch, Update sections, Skills patch
 */
const path = require('path');
const Resume = require('../models/Resume.model');
const { parseResumeText } = require('../services/pythonBridge.service');
const { extractResumeText } = require('../services/resumeParser.service');

/**
 * POST /api/resume/upload
 * Accepts file via multer, triggers Python parsing, saves to MongoDB.
 */
async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please provide a PDF or DOCX file.',
      data: null,
    });
  }

  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  const fileType = ext === 'pdf' ? 'pdf' : 'docx';
  const filePath = req.file.path;

  // Extract text locally
  let text;
  try {
    text = await extractResumeText(filePath, fileType);
  } catch (err) {
    console.error('Local text extraction error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract text from file.',
      data: null,
    });
  }

  // Call Python service to parse the extracted text
  let sections;
  try {
    sections = await parseResumeText(text);
  } catch (err) {
    console.error('Resume parsing error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to parse resume structure from text. Please try again.',
      data: null,
    });
  }

  const resume = await Resume.create({
    userId: req.userId,
    originalFileName: req.file.originalname,
    fileType,
    filePath,
    sections,
  });

  res.status(201).json({
    success: true,
    message: 'Resume uploaded and parsed successfully',
    data: { resumeId: resume._id, sections: resume.sections },
  });
}

/**
 * GET /api/resume/:id
 * Fetch full resume JSON.
 */
async function getResume(req, res) {
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

  res.json({
    success: true,
    message: 'Resume fetched successfully',
    data: resume,
  });
}

/**
 * PUT /api/resume/:id/sections
 * Update any section of the resume.
 */
async function updateSections(req, res) {
  const { sections } = req.body;

  if (!sections) {
    return res.status(400).json({
      success: false,
      message: 'sections object is required',
      data: null,
    });
  }

  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { sections } },
    { new: true, runValidators: true }
  );

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
      data: null,
    });
  }

  res.json({
    success: true,
    message: 'Sections updated successfully',
    data: resume,
  });
}

/**
 * PATCH /api/resume/:id/skills
 * Add or remove skills (used by Chrome extension).
 * Body: { add: [string], remove: [string] }
 */
async function patchSkills(req, res) {
  const { add = [], remove = [] } = req.body;

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

  let skills = resume.sections.skills || [];

  // Add new skills (avoid duplicates)
  add.forEach((skill) => {
    if (!skills.includes(skill)) {
      skills.push(skill);
    }
  });

  // Remove specified skills
  skills = skills.filter((s) => !remove.includes(s));

  resume.sections.skills = skills;
  await resume.save();

  res.json({
    success: true,
    message: 'Skills updated successfully',
    data: { skills: resume.sections.skills },
  });
}

module.exports = { uploadResume, getResume, updateSections, patchSkills };
