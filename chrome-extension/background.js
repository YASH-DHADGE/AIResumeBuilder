/**
 * Background Service Worker — Chrome Extension
 * Handles messages from content script and popup, makes API calls.
 */

const API_BASE = 'http://localhost:5000/api';

// Listen for messages from content script / popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'JOB_DESC') {
    handleJobDescription(message.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.type === 'ADD_SKILL') {
    handleAddSkill(message.skill)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'LOGIN') {
    handleLogin(message.email, message.password)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'GET_STATUS') {
    getAuthStatus()
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'GET_USER_SKILLS') {
    getUserSkills()
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function getAuthStatus() {
  const data = await chrome.storage.local.get(['jwt', 'user']);
  return {
    isLoggedIn: !!data.jwt,
    user: data.user || null,
  };
}

async function handleLogin(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Login failed');
  }

  await chrome.storage.local.set({
    jwt: data.data.token,
    user: data.data.user,
  });

  // Fetch and cache user skills right after login
  try {
    const skills = await fetchUserSkillsFromAPI(data.data.token);
    await chrome.storage.local.set({ userSkills: skills });
  } catch (_) {
    // Non-fatal — skills will be fetched on next request
  }

  return { success: true, user: data.data.user };
}

async function fetchUserSkillsFromAPI(jwt) {
  const response = await fetch(`${API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch profile');
  return data.data.skills || [];
}

/**
 * GET_USER_SKILLS — returns cached skills or fetches from API.
 */
async function getUserSkills() {
  const { jwt, userSkills } = await chrome.storage.local.get(['jwt', 'userSkills']);
  if (!jwt) return { skills: [] };

  // Return cached value if available
  if (userSkills && userSkills.length > 0) {
    return { skills: userSkills };
  }

  // Fetch from API and cache
  const skills = await fetchUserSkillsFromAPI(jwt);
  await chrome.storage.local.set({ userSkills: skills });
  return { skills };
}

async function handleJobDescription(jobDescription) {
  const { jwt } = await chrome.storage.local.get(['jwt']);

  if (!jwt) throw new Error('Not authenticated. Please log in.');

  const response = await fetch(`${API_BASE}/job/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ jobDescription }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Analysis failed');
  }

  // Store results for popup
  await chrome.storage.local.set({
    lastAnalysis: data.data,
    lastAnalyzedAt: new Date().toISOString(),
  });

  return data.data;
}

async function handleAddSkill(skill) {
  const { jwt } = await chrome.storage.local.get(['jwt']);

  if (!jwt) throw new Error('Not authenticated');

  // Patch skill onto the global User profile
  const userResponse = await fetch(`${API_BASE}/user/skills`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ add: [skill], remove: [] }),
  });

  const userData = await userResponse.json();

  if (!userData.success) {
    throw new Error(userData.message || 'Failed to add skill to user profile');
  }

  // Update cached userSkills so content.js filter refreshes
  const { userSkills = [] } = await chrome.storage.local.get(['userSkills']);
  if (!userSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
    userSkills.push(skill);
    await chrome.storage.local.set({ userSkills });
  }

  return userData.data;
}
