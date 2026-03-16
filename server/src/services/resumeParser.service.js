const fs = require('fs');
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');



/**
 * Extract text from a PDF file using Puppeteer
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPdf(filePath) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const dataBuffer = fs.readFileSync(filePath);
    const base64Data = dataBuffer.toString('base64');
    
    await page.goto('about:blank');
    
    // Inject pdf.js from CDN to parse the base64 pdf internally
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js' });
    
    const text = await page.evaluate(async (base64) => {
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\\n';
      }
      return fullText;
    }, base64Data);
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text via Puppeteer:', error);
    throw new Error('Failed to extract text from PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract text from a DOCX file using Mammoth
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Main function to parse resume text
 */
async function extractResumeText(filePath, fileType) {
  if (fileType === 'pdf') {
    return await extractTextFromPdf(filePath);
  } else if (fileType === 'docx') {
    return await extractTextFromDocx(filePath);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

module.exports = {
  extractTextFromPdf,
  extractTextFromDocx,
  extractResumeText
};
