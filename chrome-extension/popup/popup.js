/**
 * Popup Script — AI Resume Builder Chrome Extension
 * Handles login, displays ATS analysis results, and allows skill addition.
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
const statusText = document.getElementById('status-text');

const CIRCUMFERENCE = 2 * Math.PI * 54;

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', async () => {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response && response.isLoggedIn) {
      showDashboard();
      loadAnalysis();
    } else {
      showLogin();
    }
  });
});

// ─── Login ───
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = document.getElementById('ext-email').value;
  const password = document.getElementById('ext-password').value;
  const resumeId = document.getElementById('ext-resume-id').value;

  chrome.runtime.sendMessage(
    { type: 'LOGIN', email, password },
    async (response) => {
      if (response && response.error) {
        loginError.textContent = response.error;
      } else {
        await chrome.storage.local.set({ resumeId });
        showDashboard();
        statusText.textContent = 'Logged in! Open a LinkedIn job to analyze.';
      }
    }
  );
});

// ─── Logout ───
logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove(['jwt', 'user', 'resumeId', 'lastAnalysis']);
  showLogin();
});

// ─── Views ───
function showLogin() {
  loginView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
}

function showDashboard() {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
}

// ─── Load Analysis Results ───
async function loadAnalysis() {
  const { lastAnalysis } = await chrome.storage.local.get(['lastAnalysis']);
  if (!lastAnalysis) {
    statusText.textContent = 'No analysis yet. Visit a LinkedIn job page.';
    return;
  }
  renderAnalysis(lastAnalysis);
}

function renderAnalysis(data) {
  const score = data.atsScore || 0;

  // Animate score
  animateScore(score);

  // Matched chips
  matchedChips.innerHTML = '';
  (data.matchedSkills || []).forEach((skill) => {
    const chip = document.createElement('span');
    chip.className = 'chip chip-matched';
    chip.textContent = skill;
    matchedChips.appendChild(chip);
  });

  // Missing chips (clickable to add)
  missingChips.innerHTML = '';
  (data.missingSkills || []).forEach((skill) => {
    const chip = document.createElement('span');
    chip.className = 'chip chip-missing';
    chip.textContent = '+ ' + skill;
    chip.title = 'Click to add this skill to your resume';
    chip.addEventListener('click', () => addMissingSkill(skill, chip));
    missingChips.appendChild(chip);
  });

  const total = (data.matchedSkills?.length || 0) + (data.missingSkills?.length || 0);
  statusText.textContent = `Matched ${data.matchedSkills?.length || 0}/${total} skills`;
}

function animateScore(target) {
  let current = 0;
  const duration = 1500;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(target * eased);

    scoreValue.textContent = current;

    // Update ring
    const offset = CIRCUMFERENCE - (CIRCUMFERENCE * current) / 100;
    scoreRing.style.strokeDashoffset = offset;

    // Color based on score
    if (current >= 75) {
      scoreRing.style.stroke = '#10b981';
      scoreValue.style.color = '#10b981';
    } else if (current >= 50) {
      scoreRing.style.stroke = '#f59e0b';
      scoreValue.style.color = '#f59e0b';
    } else {
      scoreRing.style.stroke = '#ef4444';
      scoreValue.style.color = '#ef4444';
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

async function addMissingSkill(skill, chipEl) {
  const { resumeId } = await chrome.storage.local.get(['resumeId']);
  if (!resumeId) return;

  chipEl.style.opacity = '0.5';
  chipEl.style.pointerEvents = 'none';

  chrome.runtime.sendMessage(
    { type: 'ADD_SKILL', skill, resumeId },
    (response) => {
      if (response && response.error) {
        chipEl.style.opacity = '1';
        chipEl.style.pointerEvents = 'auto';
        statusText.textContent = 'Error: ' + response.error;
      } else {
        chipEl.className = 'chip chip-matched';
        chipEl.textContent = skill;
        statusText.textContent = `Added "${skill}" to your resume!`;
      }
    }
  );
}

// ─── Listen for new analysis results ───
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lastAnalysis && changes.lastAnalysis.newValue) {
    renderAnalysis(changes.lastAnalysis.newValue);
  }
});
