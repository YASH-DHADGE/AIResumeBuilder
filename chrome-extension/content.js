/**
 * Content Script — Job Description Scraper + Skill Filter/Sort
 * Runs on LinkedIn job pages:
 *   - injects skill-based filtering toolbar into job lists
 *   - exposes EXTRACT_JD for popup-triggered analysis
 */

(function () {
  'use strict';

  // ─── Selectors ─────────────────────────────────────────────
  const JD_SELECTORS = [
    // LinkedIn
    '.jobs-description__content', '.jobs-description-content__text', '.jobs-box__html-content', '#job-details',
    // Internshala
    '.detail_view', '.internship_details',
    // Naukri
    '.job-desc', '.danger-html',
    // YC
    '.job-description',
    // Glassdoor
    '#JobDescriptionContainer',
    // Generic
    'article', 'main', '.description__text', '.description', '#description'
  ];

  const JOB_LIST_SELECTORS = [
    '.jobs-search-results__list', '.scaffold-layout__list', '.jobs-search-results-list',
    '.internship_list_container', '#internship_list_container', '.list_container',
    '.list', '.srp-jobtuple-wrapper', '.job-results',
    '.react-job-listing-container', '#MainCol'
  ];
  const JOB_CARD_SELECTORS = [
    'li.jobs-search-results__list-item', 'li.scaffold-layout__list-item', 'div.job-card-container',
    '.individual_internship', '.internship_meta',
    '.jobTuple', '.srp-jobtuple-wrapper', 'article.jobTuple',
    '.job-item',
    '.react-job-listing', 'li.react-job-listing'
  ];

  let filterToolbarInjected = false;
  let userSkills = [];
  let filterActive = false;

  // ─── Fetch user skills from background ─────────────────────
  function loadUserSkills(callback) {
    chrome.runtime.sendMessage({ type: 'GET_USER_SKILLS' }, (response) => {
      if (response && response.skills) {
        userSkills = response.skills;
      }
      if (callback) callback();
    });
  }

  // ─── Message Listener for Popup Extraction ─────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_JD') {
      const text = getJobDescription();
      sendResponse(text);
      return false; // sync response
    }
  });

  // ─── Job Description helpers (detail page) ─────────────────
  function getJobDescription() {
    for (const selector of JD_SELECTORS) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim().length > 50) {
        return el.innerText.trim();
      }
    }
    
    // Fallback: finding largest text block
    let bestNode = document.body;
    let maxLen = 0;
    const candidates = document.querySelectorAll('div, section, article, main');
    candidates.forEach(el => {
      // Exclude script/style contents
      const clone = el.cloneNode(true);
      clone.querySelectorAll('script, style').forEach(s => s.remove());
      const text = clone.innerText || '';
      if (text.length > maxLen && text.length < 50000) { // arbitrary upper bound
        maxLen = text.length;
        bestNode = el;
      }
    });

    return bestNode.innerText || document.body.innerText;
  }

  // ─── Count how many user skills appear in a text block ─────
  function countSkillMatches(text) {
    if (!text || userSkills.length === 0) return 0;
    const lower = text.toLowerCase();
    return userSkills.filter((skill) => lower.includes(skill.toLowerCase())).length;
  }

  // ─── Get the text content of a single job card ─────────────
  function getCardText(card) {
    return card.innerText || '';
  }

  // ─── Find or create a match-count badge on a card ──────────
  function getOrCreateBadge(card) {
    let badge = card.querySelector('.ai-resume-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'ai-resume-badge';
      badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 20px;
        margin-top: 4px;
        font-family: 'Segoe UI', system-ui, sans-serif;
        pointer-events: none;
      `;
      // Try to append near the card footer or just append to card
      const footer = card.querySelector('.job-card-list__footer-wrapper, .job-card-container__footer-wrapper, .artdeco-entity-lockup__caption');
      if (footer) {
        footer.appendChild(badge);
      } else {
        card.style.position = 'relative';
        card.appendChild(badge);
      }
    }
    return badge;
  }

  function setBadge(card, count) {
    const badge = getOrCreateBadge(card);
    if (count === 0) {
      badge.textContent = '✗ 0 skill matches';
      badge.style.background = 'rgba(239,68,68,0.12)';
      badge.style.color = '#f87171';
      badge.style.border = '1px solid rgba(239,68,68,0.3)';
    } else {
      badge.textContent = `✓ ${count} skill match${count !== 1 ? 'es' : ''}`;
      badge.style.background = count >= 3 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.12)';
      badge.style.color = count >= 3 ? '#34d399' : '#fbbf24';
      badge.style.border = count >= 3
        ? '1px solid rgba(16,185,129,0.3)'
        : '1px solid rgba(245,158,11,0.3)';
    }
  }

  // ─── Apply badges + filtering + sorting to all cards ───────
  function applyFilterAndSort() {
    const list = findJobList();
    if (!list) return;

    const cards = findJobCards(list);
    if (cards.length === 0) return;

    // Score and badge every card
    cards.forEach((card) => {
      const text = getCardText(card);
      const count = countSkillMatches(text);
      card.dataset.skillMatchCount = count;
      setBadge(card, count);

      // Filter: hide/show
      if (filterActive) {
        if (count === 0) {
          card.dataset.aiHidden = 'true';
          card.style.display = 'none';
        } else {
          card.dataset.aiHidden = '';
          card.style.display = '';
        }
      } else {
        card.dataset.aiHidden = '';
        card.style.display = '';
      }
    });

    // Sort visible cards by descending match count using DOM manipulation
    sortCardsByMatchCount(list, cards);
  }

  function sortCardsByMatchCount(list, cards) {
    if (cards.length === 0) return;

    const sorted = Array.from(cards).sort((a, b) => {
      return parseInt(b.dataset.skillMatchCount || '0', 10) -
             parseInt(a.dataset.skillMatchCount || '0', 10);
    });

    // Find the common parent of the cards (may be a UL or a wrapper div inside the list)
    const parent = sorted[0].parentNode;
    if (!parent) return;

    // Re-insert in sorted order using DOM methods only (no innerHTML manipulation)
    sorted.forEach((card) => {
      parent.appendChild(card); // moves to end, building sorted list from best→worst
    });
  }

  function findJobList() {
    for (const sel of JOB_LIST_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findJobCards(container) {
    for (const sel of JOB_CARD_SELECTORS) {
      const cards = container.querySelectorAll(sel);
      if (cards.length > 0) return Array.from(cards);
    }
    return [];
  }

  // ─── Inject Filter Toolbar ──────────────────────────────────
  function injectFilterToolbar() {
    if (filterToolbarInjected) return;
    if (userSkills.length === 0) return;

    const list = findJobList();
    if (!list) return;

    // Build toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'ai-resume-filter-toolbar';
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 10px 16px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, rgba(17,24,39,0.95), rgba(30,41,59,0.95));
      border: 1px solid rgba(59,130,246,0.25);
      border-radius: 12px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      backdrop-filter: blur(12px);
      position: relative;
      z-index: 9999;
    `;

    // Label
    const label = document.createElement('span');
    label.style.cssText = `
      font-size: 12px;
      font-weight: 700;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    label.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      AI Resume Filter
    `;

    // Skill count badge
    const skillBadge = document.createElement('span');
    skillBadge.style.cssText = `
      font-size: 11px;
      color: #6b7280;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2px 8px;
    `;
    skillBadge.textContent = `${userSkills.length} skills in profile`;

    // Filter toggle button
    const filterBtn = document.createElement('button');
    filterBtn.id = 'ai-resume-filter-btn';
    filterBtn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid rgba(59,130,246,0.4);
      background: rgba(59,130,246,0.1);
      color: #93c5fd;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    `;
    filterBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      Filter by my skills
    `;

    filterBtn.addEventListener('mouseenter', () => {
      filterBtn.style.background = filterActive
        ? 'rgba(239,68,68,0.2)'
        : 'rgba(59,130,246,0.25)';
    });
    filterBtn.addEventListener('mouseleave', () => {
      filterBtn.style.background = filterActive
        ? 'rgba(16,185,129,0.15)'
        : 'rgba(59,130,246,0.1)';
    });

    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      filterActive = !filterActive;
      if (filterActive) {
        filterBtn.style.background = 'rgba(16,185,129,0.15)';
        filterBtn.style.borderColor = 'rgba(16,185,129,0.4)';
        filterBtn.style.color = '#34d399';
        filterBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Filtering by skills
        `;
      } else {
        filterBtn.style.background = 'rgba(59,130,246,0.1)';
        filterBtn.style.borderColor = 'rgba(59,130,246,0.4)';
        filterBtn.style.color = '#93c5fd';
        filterBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filter by my skills
        `;
      }
      applyFilterAndSort();
    });

    // Sort button
    const sortBtn = document.createElement('button');
    sortBtn.id = 'ai-resume-sort-btn';
    sortBtn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid rgba(139,92,246,0.4);
      background: rgba(139,92,246,0.1);
      color: #c4b5fd;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    `;
    sortBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
      Sort by match
    `;
    sortBtn.addEventListener('mouseenter', () => {
      sortBtn.style.background = 'rgba(139,92,246,0.25)';
    });
    sortBtn.addEventListener('mouseleave', () => {
      sortBtn.style.background = 'rgba(139,92,246,0.1)';
    });
    sortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      applyFilterAndSort();

      // Brief visual feedback
      sortBtn.style.background = 'rgba(16,185,129,0.2)';
      sortBtn.style.color = '#34d399';
      sortBtn.style.borderColor = 'rgba(16,185,129,0.4)';
      setTimeout(() => {
        sortBtn.style.background = 'rgba(139,92,246,0.1)';
        sortBtn.style.color = '#c4b5fd';
        sortBtn.style.borderColor = 'rgba(139,92,246,0.4)';
      }, 1500);
    });

    // Refresh button (re-fetches skills and re-scores)
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'ai-resume-refresh-btn';
    refreshBtn.title = 'Refresh skills from your profile';
    refreshBtn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid rgba(107,114,128,0.3);
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      margin-left: auto;
    `;
    refreshBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
        <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      Refresh
    `;
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      refreshBtn.style.color = '#34d399';
      loadUserSkills(() => {
        applyFilterAndSort();
        skillBadge.textContent = `${userSkills.length} skills in profile`;
        setTimeout(() => { refreshBtn.style.color = '#6b7280'; }, 1000);
      });
    });

    toolbar.appendChild(label);
    toolbar.appendChild(skillBadge);
    toolbar.appendChild(filterBtn);
    toolbar.appendChild(sortBtn);
    toolbar.appendChild(refreshBtn);

    // Insert toolbar before the job list
    list.parentNode.insertBefore(toolbar, list);
    filterToolbarInjected = true;

    // Initial badge pass
    applyFilterAndSort();
  }

  // ─── Init ───────────────────────────────────────────────────
  function init() {
    const host = window.location.hostname;
    const isJobBoard = host.includes('linkedin.com') || 
                       host.includes('internshala.com') || 
                       host.includes('naukri.com') || 
                       host.includes('workatastartup.com') || 
                       host.includes('glassdoor');

    if (isJobBoard) {
      loadUserSkills(() => {
        const tryInject = setInterval(() => {
          if (findJobList()) {
            clearInterval(tryInject);
            injectFilterToolbar();
          }
        }, 1000);
        setTimeout(() => clearInterval(tryInject), 15000);
      });
    }
  }

  // ─── SPA navigation support ─────────────────────────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      filterToolbarInjected = false;
      filterActive = false;

      const toolbar = document.getElementById('ai-resume-filter-toolbar');
      if (toolbar) toolbar.remove();

      init();
    }
  }).observe(document.body, { subtree: true, childList: true });

  init();
})();
