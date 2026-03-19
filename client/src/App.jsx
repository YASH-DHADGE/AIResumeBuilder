import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UploadPage from './pages/UploadPage';
import EditorPage from './pages/EditorPage';
import DownloadPage from './pages/DownloadPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 25, 47, 0.92)',
            color: '#e2e8f0',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '14px',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#e2e8f0' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
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
