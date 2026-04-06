/**
 * Python Bridge Service
 * Makes HTTP calls to the FastAPI microservice for AI operations.
 */
const axios = require('axios');

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_URL,
  timeout: 120000, // 2 minutes for AI operations
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Parse a resume text via Gemini Flash.
 */
async function parseResumeText(text) {
  const { data } = await pythonClient.post('/parse-resume-text', {
    text: text,
  });
  return data.sections;
}

/**
 * Extract required skills from a job description via Groq.
 */
async function extractJobSkills(jobDescription) {
  const { data } = await pythonClient.post('/extract-job-skills', {
    job_description: jobDescription,
  });
  return data.skills;
}

/**
 * Match resume skills against job skills via embeddings.
 */
async function matchSkills(resumeSkills, jobSkills) {
  const { data } = await pythonClient.post('/match-skills', {
    resume_skills: resumeSkills,
    job_skills: jobSkills,
  });
  return data;
}

/**
 * Job Intelligence: Get ATS Score
 */
async function fetchATSScore(resumeJson, jobDescription) {
  const { data } = await pythonClient.post('/ats-score', {
    resume_json: resumeJson,
    job_description: jobDescription,
  });
  return data.score_report;
}

/**
 * Job Intelligence: Get Resume Enhancements
 */
async function fetchEnhancements(resumeJson, jobDescription, jobTitle, companyName) {
  const { data } = await pythonClient.post('/enhance', {
    resume_json: resumeJson,
    job_description: jobDescription,
    job_title: jobTitle,
    company_name: companyName,
  });
  return data.enhancement_report;
}

/**
 * Job Intelligence: Generate Cover Letter
 */
async function fetchCoverLetter(resumeJson, jobDescription, jobTitle, companyName, candidateName, params = {}) {
  const { data } = await pythonClient.post('/cover-letter', {
    resume_json: resumeJson,
    job_description: jobDescription,
    job_title: jobTitle,
    company_name: companyName,
    candidate_name: candidateName,
    ...params
  });
  return data.cover_letter;
}

module.exports = { 
  parseResumeText, 
  extractJobSkills, 
  matchSkills,
  fetchATSScore,
  fetchEnhancements,
  fetchCoverLetter
};
