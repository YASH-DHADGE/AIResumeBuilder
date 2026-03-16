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

module.exports = { parseResumeText, extractJobSkills, matchSkills };
