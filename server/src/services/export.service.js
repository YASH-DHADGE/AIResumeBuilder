/**
 * Export Service
 * Generates DOCX (via docxtemplater) and PDF (via Puppeteer) from resume data.
 */
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const puppeteer = require('puppeteer');

const EXPORTS_DIR = path.join(__dirname, '..', '..', 'uploads', 'exports');
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

/**
 * Generate a DOCX file from resume sections using docxtemplater.
 */
async function generateDocx(resumeId, sections) {
  const templatePath = path.join(TEMPLATES_DIR, 'resume_template.docx');

  if (!fs.existsSync(templatePath)) {
    throw new Error('DOCX template not found at ' + templatePath);
  }

  const templateContent = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Prepare template data
  const templateData = {
    name: sections.personalInfo?.name || '',
    email: sections.personalInfo?.email || '',
    phone: sections.personalInfo?.phone || '',
    location: sections.personalInfo?.location || '',
    linkedin: sections.personalInfo?.linkedin || '',
    github: sections.personalInfo?.github || '',
    summary: sections.summary || '',
    skills: (sections.skills || []).join(', '),
    experience: (sections.experience || []).map((exp) => ({
      company: exp.company || '',
      role: exp.role || '',
      duration: exp.duration || '',
      bullets: (exp.bullets || []).map((b) => ({ text: b })),
    })),
    education: (sections.education || []).map((edu) => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      year: edu.year || '',
      gpa: edu.gpa || '',
    })),
    projects: (sections.projects || []).map((proj) => ({
      name: proj.name || '',
      description: proj.description || '',
      techStack: (proj.techStack || []).join(', '),
      link: proj.link || '',
    })),
    certifications: (sections.certifications || []).map((c) => ({ text: c })),
  };

  doc.render(templateData);

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  const outputPath = path.join(EXPORTS_DIR, `${resumeId}.docx`);
  fs.writeFileSync(outputPath, buf);

  return outputPath;
}

/**
 * Generate a PDF from resume data using Puppeteer.
 */
async function generatePdf(resumeId, sections) {
  const html = buildResumeHtml(sections);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.join(EXPORTS_DIR, `${resumeId}.pdf`);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    printBackground: true,
  });

  await browser.close();

  return outputPath;
}

/**
 * Build a styled HTML resume for PDF generation.
 */
function buildResumeHtml(sections) {
  const pi = sections.personalInfo || {};
  const experienceHtml = (sections.experience || [])
    .map(
      (exp) => `
      <div class="entry">
        <div class="entry-header">
          <strong>${exp.role || ''}</strong> at <em>${exp.company || ''}</em>
          <span class="duration">${exp.duration || ''}</span>
        </div>
        <ul>${(exp.bullets || []).map((b) => `<li>${b}</li>`).join('')}</ul>
      </div>`
    )
    .join('');

  const educationHtml = (sections.education || [])
    .map(
      (edu) => `
      <div class="entry">
        <strong>${edu.degree || ''}</strong> — ${edu.institution || ''}
        <span class="duration">${edu.year || ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</span>
      </div>`
    )
    .join('');

  const projectsHtml = (sections.projects || [])
    .map(
      (proj) => `
      <div class="entry">
        <strong>${proj.name || ''}</strong>
        ${proj.link ? `<a href="${proj.link}">${proj.link}</a>` : ''}
        <p>${proj.description || ''}</p>
        ${proj.techStack?.length ? `<p class="tech-stack">Tech: ${proj.techStack.join(', ')}</p>` : ''}
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; padding: 20px; }
    h1 { font-size: 22pt; color: #0f172a; margin-bottom: 4px; }
    .contact { color: #475569; font-size: 9pt; margin-bottom: 16px; }
    .contact a { color: #2563eb; text-decoration: none; }
    h2 { font-size: 13pt; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 2px; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 1px; }
    .entry { margin-bottom: 10px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .duration { color: #64748b; font-size: 9pt; }
    ul { margin-left: 20px; margin-top: 4px; }
    li { margin-bottom: 2px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; font-size: 9pt; }
    .tech-stack { color: #64748b; font-size: 9pt; font-style: italic; }
    .cert-list { list-style: disc; margin-left: 20px; }
  </style>
</head>
<body>
  <h1>${pi.name || 'Your Name'}</h1>
  <div class="contact">
    ${[pi.email, pi.phone, pi.location].filter(Boolean).join(' | ')}
    ${pi.linkedin ? ` | <a href="${pi.linkedin}">LinkedIn</a>` : ''}
    ${pi.github ? ` | <a href="${pi.github}">GitHub</a>` : ''}
  </div>

  ${sections.summary ? `<h2>Professional Summary</h2><p>${sections.summary}</p>` : ''}

  ${(sections.experience || []).length ? `<h2>Experience</h2>${experienceHtml}` : ''}

  ${(sections.education || []).length ? `<h2>Education</h2>${educationHtml}` : ''}

  ${(sections.skills || []).length ? `<h2>Skills</h2><div class="skills">${sections.skills.map((s) => `<span class="skill-tag">${s}</span>`).join('')}</div>` : ''}

  ${(sections.projects || []).length ? `<h2>Projects</h2>${projectsHtml}` : ''}

  ${(sections.certifications || []).length ? `<h2>Certifications</h2><ul class="cert-list">${sections.certifications.map((c) => `<li>${c}</li>`).join('')}</ul>` : ''}
</body>
</html>`;
}

module.exports = { generateDocx, generatePdf };
