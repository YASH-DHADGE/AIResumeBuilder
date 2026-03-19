/**
 * Job Controller — Analyze job description against resume
 */
const Resume = require('../models/Resume.model');
const { extractJobSkills, matchSkills } = require('../services/pythonBridge.service');

/**
 * POST /api/job/analyze
 * Analyzes a job description against a resume.
 * Body: { jobDescription, resumeId }
 */
async function analyzeJob(req, res) {
  const { jobDescription, resumeId } = req.body;

  if (!jobDescription) {
    return res.status(400).json({
      success: false,
      message: 'jobDescription is required',
      data: null,
    });
  }

  // 1. Extract skills from job description via Groq
  let jobSkills;
  try {
    jobSkills = await extractJobSkills(jobDescription);
  } catch (err) {
    console.error('Job skill extraction error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract job skills',
      data: null,
    });
  }

  // 2. Fetch skills to compare against (either from a specific resume or the global User profile)
  let resumeSkills = [];
  let resumeDoc = null;

  if (resumeId) {
    resumeDoc = await Resume.findOne({ _id: resumeId, userId: req.userId });
    if (!resumeDoc) {
      return res.status(404).json({ success: false, message: 'Resume not found', data: null });
    }
    resumeSkills = resumeDoc.sections.skills || [];
  } else {
    // Fall back to global user profile skills if no resumeId is provided
    const User = require('../models/User.model');
    const userDoc = await User.findById(req.userId);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }
    resumeSkills = userDoc.skills || [];
  }

  // 3. Match skills via embeddings
  let matchResult;
  try {
    matchResult = await matchSkills(resumeSkills, jobSkills);
  } catch (err) {
    console.error('Skill matching error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to match skills',
      data: null,
    });
  }

  // 4. Update resume in MongoDB (only if resumeId was provided)
  if (resumeDoc) {
    resumeDoc.atsScore = matchResult.ats_score;
    resumeDoc.matchedSkills = matchResult.matched;
    resumeDoc.missingSkills = matchResult.missing;
    resumeDoc.lastJobDescription = jobDescription;
    await resumeDoc.save();
  }

  res.json({
    success: true,
    message: 'Job analysis complete',
    data: {
      matchedSkills: matchResult.matched,
      missingSkills: matchResult.missing,
      atsScore: matchResult.ats_score,
      jobSkills,
    },
  });
}

module.exports = { analyzeJob };
