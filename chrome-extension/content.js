/**
 * Content Script — LinkedIn Job Description Scraper
 * Runs on LinkedIn job pages, scrapes the job description,
 * and sends it to the background service worker.
 */

(function () {
  'use strict';

  // Selectors for LinkedIn job description content
  const JD_SELECTORS = [
    '.jobs-description__content',
    '.jobs-description-content__text',
    '.jobs-box__html-content',
    '#job-details',
    '.description__text',
  ];

  let lastSentJD = '';
  let floatingBtn = null;

  function getJobDescription() {
    for (const selector of JD_SELECTORS) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        return el.innerText.trim();
      }
    }
    return null;
  }

  function createFloatingButton() {
    if (floatingBtn) return;

    floatingBtn = document.createElement('div');
    floatingBtn.id = 'ai-resume-ext-btn';
    floatingBtn.innerHTML = `
      <button id="ai-resume-analyze-btn" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        background: linear-gradient(135deg, #3b82f6, #06b6d4);
        color: white;
        border: none;
        border-radius: 16px;
        padding: 12px 20px;
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
        transition: all 0.3s ease;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        Analyze with AI Resume Builder
      </button>
    `;

    document.body.appendChild(floatingBtn);

    document.getElementById('ai-resume-analyze-btn').addEventListener('click', () => {
      const jd = getJobDescription();
      if (jd && jd !== lastSentJD) {
        lastSentJD = jd;
        chrome.runtime.sendMessage({ type: 'JOB_DESC', payload: jd }, (response) => {
          if (response && response.error) {
            showNotification('Error: ' + response.error, 'error');
          } else if (response) {
            showNotification(
              `ATS Score: ${response.atsScore}% | Matched: ${response.matchedSkills?.length || 0} | Missing: ${response.missingSkills?.length || 0}`,
              'success'
            );
          }
        });
        showNotification('Analyzing job description...', 'info');
      } else if (!jd) {
        showNotification('Could not find job description on this page.', 'error');
      }
    });
  }

  function showNotification(message, type) {
    const existing = document.getElementById('ai-resume-notification');
    if (existing) existing.remove();

    const colors = {
      success: { bg: '#065f46', border: '#10b981' },
      error: { bg: '#7f1d1d', border: '#ef4444' },
      info: { bg: '#1e3a8a', border: '#3b82f6' },
    };

    const c = colors[type] || colors.info;

    const el = document.createElement('div');
    el.id = 'ai-resume-notification';
    el.style.cssText = `
      position: fixed; bottom: 80px; right: 24px; z-index: 99999;
      background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 12px;
      padding: 12px 20px; color: white; font-family: 'Segoe UI', sans-serif;
      font-size: 13px; max-width: 350px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease-out;
    `;
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 5000);
  }

  // Initialize on LinkedIn job pages
  function init() {
    if (window.location.href.includes('linkedin.com/jobs')) {
      // Wait for job description to load
      const checkInterval = setInterval(() => {
        const jd = getJobDescription();
        if (jd) {
          clearInterval(checkInterval);
          createFloatingButton();
        }
      }, 1000);

      // Stop checking after 30 seconds
      setTimeout(() => clearInterval(checkInterval), 30000);
    }
  }

  // Handle LinkedIn's SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      lastSentJD = '';
      if (floatingBtn) { floatingBtn.remove(); floatingBtn = null; }
      init();
    }
  }).observe(document.body, { subtree: true, childList: true });

  init();
})();
