/**
 * API Service — Axios instance and all API call functions
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ─── User Profile ───
export const getUserProfile = () => api.get('/user/profile');
export const putUserProfile = (data) => api.put('/user/profile', data);

// ─── Resume ───
export const uploadResume = (formData) =>
  api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (formData._onProgress) formData._onProgress(percent);
    },
  });

export const getResume = (id) => api.get(`/resume/${id}`);

export const updateSections = (id, sections) =>
  api.put(`/resume/${id}/sections`, { sections });

export const patchSkills = (id, add = [], remove = []) =>
  api.patch(`/resume/${id}/skills`, { add, remove });

// ─── Job Analysis ───
export const analyzeJob = (jobDescription, resumeId) =>
  api.post('/job/analyze', { jobDescription, resumeId });

// ─── Export ───
export const exportDocx = (id) =>
  api.post(`/export/${id}/docx`, {}, { responseType: 'blob' });

export const exportPdf = (id) =>
  api.post(`/export/${id}/pdf`, {}, { responseType: 'blob' });

export const exportEmail = (id, email) =>
  api.post(`/export/${id}/email`, { email });

export default api;
