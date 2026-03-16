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
    handleAddSkill(message.skill, message.resumeId)
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
});

async function getAuthStatus() {
  const data = await chrome.storage.local.get(['jwt', 'user', 'resumeId']);
  return {
    isLoggedIn: !!data.jwt,
    user: data.user || null,
    resumeId: data.resumeId || null,
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

  return { success: true, user: data.data.user };
}

async function handleJobDescription(jobDescription) {
  const { jwt, resumeId } = await chrome.storage.local.get(['jwt', 'resumeId']);

  if (!jwt) throw new Error('Not authenticated. Please log in.');
  if (!resumeId) throw new Error('No resume ID set. Please set it in the popup.');

  const response = await fetch(`${API_BASE}/job/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ jobDescription, resumeId }),
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

async function handleAddSkill(skill, resumeId) {
  const { jwt } = await chrome.storage.local.get(['jwt']);

  if (!jwt) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/resume/${resumeId}/skills`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ add: [skill], remove: [] }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to add skill');
  }

  return data.data;
}
