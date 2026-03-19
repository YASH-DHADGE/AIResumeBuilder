/**
 * Popup Script — AI Resume Builder Chrome Extension
 * Handles login, ATS analysis rendering, and one-click skill sync.
 */

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('ext-logout-btn');

const scoreValue = document.getElementById('score-value');
const scoreRing = document.getElementById('score-ring');
const matchedChips = document.getElementById('matched-chips');
const missingChips = document.getElementById('missing-chips');
const userSkillsChips = document.getElementById('user-skills-chips');
const skillsCountBadge = document.getElementById('skills-count-badge');
const statusBar = document.getElementById('status-bar');
const statusText = document.getElementById('status-text');
const analyzeBtn = document.getElementById('ext-analyze-btn');
const loginBtn = document.getElementById('ext-login-btn');

const CIRCUMFERENCE = 2 * Math.PI * 54;
const STATUS_TONES = ['status-success', 'status-error', 'status-warning'];
const ANALYZE_BUTTON_TEXT = analyzeBtn
  ? analyzeBtn.innerHTML
  : '<span class="icon">✦</span>Analyze job on this page';

initialize();

function initialize() {
  resetAnalysisView();

  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response && response.isLoggedIn) {
      showDashboard();
      loadUserSkills();
      loadAnalysis();
    } else {
      showLogin();
      setStatus('Sign in to analyze jobs and sync skills.', 'warning');
    }
  });

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeActiveTab);
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.lastAnalysis && changes.lastAnalysis.newValue) {
      renderAnalysis(changes.lastAnalysis.newValue);
    }

    if (changes.userSkills && changes.userSkills.newValue) {
      renderUserSkills(changes.userSkills.newValue);
    }
  });
}

function handleLoginSubmit(event) {
  event.preventDefault();
  loginError.textContent = '';

  const emailInput = document.getElementById('ext-email');
  const passwordInput = document.getElementById('ext-password');
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!email || !password) {
    loginError.textContent = 'Email and password are required.';
    setStatus('Email and password are required.', 'error');
    return;
  }

  setButtonLoading(loginBtn, true, 'Signing in...');

  chrome.runtime.sendMessage({ type: 'LOGIN', email, password }, (response) => {
    setButtonLoading(loginBtn, false, 'Sign In');

    if (response && response.error) {
      loginError.textContent = response.error;
      setStatus('Login failed. Check your credentials.', 'error');
      return;
    }

    showDashboard();
    setStatus('Logged in. Open a job page and analyze.', 'success');
    loadUserSkills();
    loadAnalysis();
  });
}

async function handleLogout() {
  await chrome.storage.local.remove(['jwt', 'user', 'lastAnalysis', 'userSkills']);
  showLogin();
  resetAnalysisView();
  setStatus('Signed out from extension.', 'warning');
}

function showLogin() {
  loginView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
}

function showDashboard() {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
}

function analyzeActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      setStatus('Cannot access active tab.', 'error');
      return;
    }

    setAnalyzeLoading(true);

    chrome.tabs.sendMessage(tabs[0].id, { type: 'EXTRACT_JD' }, (jd) => {
      if (chrome.runtime.lastError || !jd || !jd.trim()) {
        const message = chrome.runtime.lastError
          ? chrome.runtime.lastError.message
          : 'Could not extract job description from this page.';
        setStatus(message, 'error');
        setAnalyzeLoading(false);
        return;
      }

      setStatus('Analyzing job requirements...', 'warning');
      chrome.runtime.sendMessage({ type: 'JOB_DESC', payload: jd }, (response) => {
        setAnalyzeLoading(false);

        if (response && response.error) {
          setStatus(`Error: ${response.error}`, 'error');
          return;
        }

        setStatus('Analysis complete.', 'success');
      });
    });
  });
}

function loadUserSkills() {
  chrome.runtime.sendMessage({ type: 'GET_USER_SKILLS' }, (response) => {
    const skills = (response && response.skills) || [];
    renderUserSkills(skills);
  });
}

function renderUserSkills(skills) {
  userSkillsChips.innerHTML = '';
  skillsCountBadge.textContent = String(skills.length);

  if (!skills.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No profile skills yet.';
    userSkillsChips.appendChild(empty);
    return;
  }

  skills.forEach((skill) => {
    const chip = document.createElement('span');
    chip.className = 'chip chip-user';
    chip.textContent = skill;
    userSkillsChips.appendChild(chip);
  });
}

async function loadAnalysis() {
  const { lastAnalysis } = await chrome.storage.local.get(['lastAnalysis']);
  if (!lastAnalysis) {
    resetAnalysisView();
    setStatus('No analysis yet. Visit a job page and run analysis.', 'warning');
    return;
  }

  renderAnalysis(lastAnalysis);
}

function resetAnalysisView() {
  scoreValue.textContent = '—';
  scoreRing.style.strokeDashoffset = String(CIRCUMFERENCE);

  matchedChips.innerHTML = '';
  missingChips.innerHTML = '';

  const matchedEmpty = document.createElement('p');
  matchedEmpty.className = 'empty-state';
  matchedEmpty.textContent = 'Matched skills will appear after analysis.';

  const missingEmpty = document.createElement('p');
  missingEmpty.className = 'empty-state';
  missingEmpty.textContent = 'Missing skills will appear after analysis.';

  matchedChips.appendChild(matchedEmpty);
  missingChips.appendChild(missingEmpty);
}

function renderAnalysis(data) {
  const score = Math.max(0, Math.min(100, data.atsScore || 0));
  const matched = Array.isArray(data.matchedSkills) ? data.matchedSkills : [];
  const missing = Array.isArray(data.missingSkills) ? data.missingSkills : [];

  animateScore(score);

  matchedChips.innerHTML = '';
  renderReadonlySkillChips(
    matchedChips,
    matched,
    'chip chip-matched',
    'No matched skills in this job yet.'
  );

  missingChips.innerHTML = '';
  if (!missing.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No missing skills detected.';
    missingChips.appendChild(empty);
  } else {
    missing.forEach((skill) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip chip-missing';
      chip.textContent = `+ ${skill}`;
      chip.title = 'Click to add this skill to your resume and profile';
      chip.addEventListener('click', () => addMissingSkill(skill, chip));
      missingChips.appendChild(chip);
    });
  }

  const total = matched.length + missing.length;
  setStatus(`Matched ${matched.length}/${total || 0} skills`, 'success');
}

function renderReadonlySkillChips(container, skills, chipClass, emptyMessage) {
  if (!skills.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  skills.forEach((skill) => {
    const chip = document.createElement('span');
    chip.className = chipClass;
    chip.textContent = skill;
    container.appendChild(chip);
  });
}

function animateScore(target) {
  const finalTarget = Math.max(0, Math.min(100, target));
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(finalTarget * eased);

    scoreValue.textContent = String(current);

    const offset = CIRCUMFERENCE - (CIRCUMFERENCE * current) / 100;
    scoreRing.style.strokeDashoffset = String(offset);

    if (current >= 75) {
      scoreRing.style.stroke = '#34d399';
      scoreValue.style.color = '#34d399';
    } else if (current >= 50) {
      scoreRing.style.stroke = '#fbbf24';
      scoreValue.style.color = '#fbbf24';
    } else {
      scoreRing.style.stroke = '#f87171';
      scoreValue.style.color = '#f87171';
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function addMissingSkill(skill, chipEl) {
  chipEl.classList.add('is-loading');
  chipEl.disabled = true;
  chipEl.textContent = `... ${skill}`;

  chrome.runtime.sendMessage({ type: 'ADD_SKILL', skill }, (response) => {
    if (response && response.error) {
      chipEl.classList.remove('is-loading');
      chipEl.disabled = false;
      chipEl.textContent = `+ ${skill}`;
      setStatus(`Error: ${response.error}`, 'error');
      return;
    }

    chipEl.className = 'chip chip-matched is-added';
    chipEl.textContent = `✓ ${skill}`;
    chipEl.disabled = true;

    setStatus(`Added "${skill}" to your profile.`, 'success');
    loadUserSkills();
  });
}

function setStatus(message, tone = 'warning') {
  statusText.textContent = message;
  statusBar.classList.remove(...STATUS_TONES);
  if (tone && tone !== 'info') {
    statusBar.classList.add(`status-${tone}`);
  }
}

function setAnalyzeLoading(loading) {
  if (!analyzeBtn) return;
  analyzeBtn.disabled = loading;
  analyzeBtn.innerHTML = loading
    ? '<span class="icon">...</span>Analyzing...'
    : ANALYZE_BUTTON_TEXT;
}

function setButtonLoading(button, loading, loadingLabel) {
  if (!button) return;
  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = loading;
  button.textContent = loading ? loadingLabel : button.dataset.defaultText;
}
