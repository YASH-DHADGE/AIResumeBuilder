import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadResume } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FileType2,
  LogOut,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react';
import JobDashboard from '../components/JobSuite/JobDashboard';
import ThemeToggle from '../components/ThemeToggle';
import { JobAnalysisProvider } from '../context/JobAnalysisContext';
import {
  clearSession,
  getAuthToken,
  getDisplayName,
  getStoredUser,
  getUserInitial,
  requireAuth,
} from '../utils/auth';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedResume, setParsedResume] = useState(null);

  useEffect(() => {
    requireAuth(navigate);
  }, [navigate]);

  const token = getAuthToken();
  if (!token) return null;

  const user = getStoredUser();
  const userName = getDisplayName(user);
  const userInitial = getUserInitial(user);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');

    const formData = new FormData();
    formData.append('file', file);
    formData._onProgress = (p) => setProgress(p);

    setUploading(true);
    setProgress(0);

    try {
      const { data } = await uploadResume(formData);
      toast.success(data.message);
      setParsedResume(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveToDB = () => {
    if (!parsedResume) return;
    toast.success('Resume saved to database');
    navigate(`/editor/${parsedResume.resumeId}`);
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12 text-primary-400" />;
    return file.name.endsWith('.pdf')
      ? <FileText className="w-12 h-12 text-red-400" />
      : <FileType2 className="w-12 h-12 text-blue-400" />;
  };

  return (
    <JobAnalysisProvider resumeId={parsedResume?.resumeId}>
      <div className="app-shell min-h-screen flex flex-col overflow-y-auto">
        <header className="sticky top-0 z-50 border-b border-dark-700/70 bg-dark-950/75 backdrop-blur-xl">
          <div className="page-wrap flex h-16 items-center justify-between">
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-3"
              aria-label="Go to upload page"
            >
              <div className="brand-mark h-9 w-9 rounded-xl">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Workspace</p>
                <p className="font-display text-base font-semibold text-dark-50">RoleReady</p>
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                id="profile-btn"
                onClick={() => navigate('/profile')}
                className="btn-secondary flex items-center gap-2 px-3 py-2"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
                  {userInitial}
                </span>
                <span className="hidden text-sm sm:inline">{userName}</span>
              </button>
              <button
                id="logout-btn"
                onClick={() => {
                  clearSession();
                  navigate('/login');
                }}
                className="btn-ghost flex items-center gap-2 px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="page-wrap py-8 space-y-12">
          {/* Step 1: Upload */}
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="panel-card-strong relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-orange-300/15 blur-3xl" />
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-300 text-dark-950 font-bold text-sm">1</span>
                <span className="section-kicker">Upload Source</span>
              </div>
              <h1 className="font-display text-3xl font-semibold text-dark-50 sm:text-4xl">
                Start with your current resume.
              </h1>
              <p className="mt-3 text-dark-300">
                Drag and drop your latest file. We'll extract your history and skills for AI optimization.
              </p>

              <div
                {...getRootProps()}
                className={`mt-7 cursor-pointer rounded-3xl border border-dashed p-8 text-center transition-all duration-300
                  ${isDragActive
                    ? 'border-orange-200 bg-orange-200/10'
                    : file
                      ? 'border-emerald-400/60 bg-emerald-500/10'
                      : 'border-dark-600/80 bg-dark-900/60 hover:border-orange-200/60 hover:bg-orange-200/5'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dark-600/80 bg-dark-900/70">
                    {getFileIcon()}
                  </div>
                  {file ? (
                    <p className="max-w-full truncate text-sm text-dark-200">{file.name}</p>
                  ) : (
                    <p className="text-lg font-semibold text-dark-100">Drop PDF or DOCX</p>
                  )}
                </div>
              </div>

              {!parsedResume && (
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-3 shadow-[0_16px_28px_-14px_rgba(251,146,60,0.72)]"
                >
                  {uploading ? (
                    <>Parsing Resume...</>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Initialize Profile
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </section>

            <section className="space-y-6">
              {parsedResume ? (
                <article className="panel-card border-emerald-400/30 bg-emerald-500/5 p-6 animate-slide-up">
                  <div className="mb-5 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <h2 className="font-display text-xl font-semibold text-dark-50">Profile Ready</h2>
                      <p className="text-sm text-dark-400">Basic extraction complete.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveToDB}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    Open Full Editor <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ) : (
                <article className="panel-card p-6 border-dark-700/50 bg-dark-900/40">
                  <h2 className="font-display text-xl font-semibold text-dark-50 mb-4">Quick Start Guide</h2>
                  <ul className="space-y-4 text-sm text-dark-300">
                    <li className="flex gap-3">
                      <span className="text-orange-200 font-bold">01</span>
                      <span>Upload your PDF or DOCX file first.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-200 font-bold">02</span>
                      <span>Enter the job description in the panel below.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-200 font-bold">03</span>
                      <span>Generate ATS insights and a custom cover letter.</span>
                    </li>
                  </ul>
                </article>
              )}
              <article className="panel-card p-5 border-dark-700/50 bg-dark-900/20">
                <div className="flex items-center gap-3 text-dark-400 text-xs">
                  <Shield className="h-4 w-4" />
                  Your data is encrypted and used only for your session.
                </div>
              </article>
            </section>
          </div>

          {/* Step 2: Job Matching (Intelligence Suite) */}
          <section className="animate-slide-up">
             <div className="flex items-center gap-3 mb-6">
               <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-300 text-dark-950 font-bold text-sm">2</span>
               <h2 className="font-display text-3xl font-semibold text-dark-50">Match Role Intelligence</h2>
             </div>
             <p className="text-dark-400 max-w-3xl mb-8">
               Paste the job description you're targeting. We'll run a deep ATS analysis, suggest specific wording improvements, 
               and draft a tailored cover letter based on your matched skills.
             </p>
             
             <div className="bg-dark-900/40 rounded-[2rem] border border-dark-700/50 p-1">
                <JobDashboard resume={parsedResume} />
             </div>
          </section>

          <footer className="pt-12 pb-8 border-t border-dark-800 text-center text-dark-500 text-sm">
            <p>&copy; 2026 RoleReady — Premium Intelligence Suite</p>
          </footer>
        </main>
      </div>
    </JobAnalysisProvider>
  );
}
