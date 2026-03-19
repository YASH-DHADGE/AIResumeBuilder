export function getAuthToken() {
  return localStorage.getItem('token');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function requireAuth(navigate) {
  const token = getAuthToken();
  if (!token) {
    navigate('/login');
    return false;
  }
  return true;
}

export function getDisplayName(user) {
  if (!user) return 'Profile';
  const fullName = user.name?.trim();
  if (fullName) return fullName;
  const email = user.email?.trim();
  if (email) return email.split('@')[0];
  return 'Profile';
}

export function getUserInitial(user) {
  const name = getDisplayName(user);
  return name.charAt(0).toUpperCase();
}