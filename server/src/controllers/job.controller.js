/**
 * Job Controller — Analyze job description against resume using Job Intelligence Suite
 */
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const { fetchATSScore, fetchEnhancements, fetchCoverLetter } = require('../services/pythonBridge.service');

async function getResumeData(resumeId, userId) {
  if (resumeId && resumeId !== 'null' && resumeId !== 'undefined') {
    const resumeDoc = await Resume.findOne({ _id: resumeId, userId });
    if (!resumeDoc) throw new Error('Resume not found');
    return { sections: resumeDoc.sections, doc: resumeDoc };
  }

  // Fallback to User profile
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Check if profile is empty (at least skills or experience should exist)
  const hasSkills = user.skills && user.skills.length > 0;
  const hasExp = user.experience && user.experience.length > 0;

  if (!hasSkills && !hasExp) {
    const err = new Error('Your profile is empty. Please upload a resume or add skills to your profile first.');
    err.code = 'PROFILE_EMPTY';
    throw err;
  }

  return {
    sections: {
      skills: user.skills || [],
      summary: user.summary || '',
      experience: user.experience || [],
      education: user.education || [],
      projects: user.projects || [],
      personalInfo: user.personalInfo || {},
    },
    doc: null,
  };
}

/**
 * POST /api/job/ats-score
 * Analyzes a job description against a resume for ATS score.
 */
async function generateAtsScore(req, res) {
  const { jobDescription, resumeId } = req.body;
  if (!jobDescription) return res.status(400).json({ success: false, message: 'jobDescription is required', data: null });

  try {
    const { sections, doc } = await getResumeData(resumeId, req.userId);
    const scoreReport = await fetchATSScore(sections, jobDescription);
    
    // Update resume in MongoDB if it exists
    if (doc) {
      doc.atsScore = scoreReport.overall_score;
      doc.matchedSkills = scoreReport.breakdown?.keyword_match?.matched || [];
      doc.missingSkills = scoreReport.breakdown?.keyword_match?.missing || [];
      doc.lastJobDescription = jobDescription;
      await doc.save();
    }

    return res.json({
      success: true,
      message: 'ATS Score generated',
      data: scoreReport,
    });
  } catch (err) {
    console.error('ATS Score error:', err.message);
    const status = err.code === 'PROFILE_EMPTY' ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message, data: null, code: err.code });
  }
}

/**
 * POST /api/job/enhance
 * Generates resume enhancements tailored to JD.
 */
async function generateEnhancements(req, res) {
  const { jobDescription, resumeId, jobTitle, companyName } = req.body;
  if (!jobDescription) return res.status(400).json({ success: false, message: 'jobDescription is required', data: null });

  try {
    const { sections } = await getResumeData(resumeId, req.userId);
    const enhancementReport = await fetchEnhancements(
      sections, 
      jobDescription, 
      jobTitle || 'Target Role', 
      companyName || 'Target Company'
    );
    
    return res.json({
      success: true,
      message: 'Enhancements generated',
      data: enhancementReport,
    });
  } catch (err) {
    console.error('Enhancement generation error:', err.message);
    const status = err.code === 'PROFILE_EMPTY' ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message, data: null, code: err.code });
  }
}

/**
 * POST /api/job/cover-letter
 * Generates an ATS-friendly cover letter.
 */
async function generateCoverLetter(req, res) {
  const { jobDescription, resumeId, jobTitle, companyName, tone, length, style, format } = req.body;
  if (!jobDescription) return res.status(400).json({ success: false, message: 'jobDescription is required', data: null });

  try {
    const { sections } = await getResumeData(resumeId, req.userId);
    const candidateName = sections.personalInfo?.name || 'Candidate';
    
    const coverLetter = await fetchCoverLetter(
      sections, 
      jobDescription, 
      jobTitle || 'Target Role', 
      companyName || 'Target Company', 
      candidateName, 
      { tone, length, style, format }
    );
    
    return res.json({
      success: true,
      message: 'Cover letter generated',
      data: coverLetter,
    });
  } catch (err) {
    console.error('Cover letter generation error:', err.message);
    const status = err.code === 'PROFILE_EMPTY' ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message, data: null, code: err.code });
  }
}

module.exports = { generateAtsScore, generateEnhancements, generateCoverLetter };
