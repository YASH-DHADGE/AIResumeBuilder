/**
 * Script to programmatically generate the DOCX template.
 * Run: node generate-template.js
 *
 * This creates a valid .docx file with docxtemplater template tags.
 */
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

// Minimal DOCX structure as a zip
const JSZip = require('pizzip');

function createTemplate() {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // _rels/.rels
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/_rels/document.xml.rels
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // word/document.xml — the actual template with docxtemplater tags
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Title"/><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>{name}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>{email} | {phone} | {location}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>{linkedin} | {github}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr><w:t>Professional Summary</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>{summary}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr><w:t>Experience</w:t></w:r>
    </w:p>
    {#experience}
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{role} at {company}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> — {duration}</w:t></w:r>
    </w:p>
    {#bullets}
    <w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>
      <w:r><w:t>{text}</w:t></w:r>
    </w:p>
    {/bullets}
    {/experience}
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr><w:t>Education</w:t></w:r>
    </w:p>
    {#education}
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{degree} — {institution}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> | {year} {gpa}</w:t></w:r>
    </w:p>
    {/education}
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr><w:t>Skills</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>{skills}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr><w:t>Projects</w:t></w:r>
    </w:p>
    {#projects}
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{name}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> — {techStack}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>{description}</w:t></w:r></w:p>
    {/projects}
    <w:p><w:r><w:t></w:t></w:r></w:p>

    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr><w:t>Certifications</w:t></w:r>
    </w:p>
    {#certifications}
    <w:p><w:r><w:t>• {text}</w:t></w:r></w:p>
    {/certifications}

    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>
  </w:body>
</w:document>`);

  const templatesDir = path.join(__dirname, 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  const outputPath = path.join(templatesDir, 'resume_template.docx');
  const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outputPath, buf);

  console.log(`✅ Template created at: ${outputPath}`);
}

createTemplate();
