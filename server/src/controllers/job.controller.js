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

  if (!jobDescription || !resumeId) {
    return res.status(400).json({
      success: false,
      message: 'jobDescription and resumeId are required',
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

  // 2. Fetch resume from DB
  const resume = await Resume.findOne({
    _id: resumeId,
    userId: req.userId,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
      data: null,
    });
  }

  const resumeSkills = resume.sections.skills || [];

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

  // 4. Update resume in MongoDB
  resume.atsScore = matchResult.ats_score;
  resume.matchedSkills = matchResult.matched;
  resume.missingSkills = matchResult.missing;
  resume.lastJobDescription = jobDescription;
  await resume.save();

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
