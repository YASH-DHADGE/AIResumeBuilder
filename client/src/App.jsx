import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UploadPage from './pages/UploadPage';
import EditorPage from './pages/EditorPage';
import DownloadPage from './pages/DownloadPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

const THEME_KEY = 'roleready_theme';

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toastStyle = useMemo(() => {
    if (theme === 'light') {
      return {
        background: 'rgba(248, 250, 252, 0.95)',
        color: '#1e293b',
        border: '1px solid rgba(148, 163, 184, 0.45)',
        borderRadius: '14px',
        backdropFilter: 'blur(12px)',
      };
    }

    return {
      background: 'rgba(10, 25, 47, 0.92)',
      color: '#e2e8f0',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      borderRadius: '14px',
      backdropFilter: 'blur(12px)',
    };
  }, [theme]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: toastStyle,
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'light' ? '#0f172a' : '#e2e8f0',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: theme === 'light' ? '#0f172a' : '#f1f5f9',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/editor/:resumeId" element={<EditorPage />} />
        <Route path="/download/:resumeId" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
