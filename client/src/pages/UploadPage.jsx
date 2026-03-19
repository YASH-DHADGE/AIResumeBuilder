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
    <div className="app-shell">
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
              <p className="font-display text-base font-semibold text-dark-50">AI Resume Builder</p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
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

      <main className="page-wrap grid flex-1 gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel-card-strong p-6 sm:p-8">
          <span className="section-kicker">Upload Resume</span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-dark-50 sm:text-4xl">
            Turn your existing resume into a live, editable profile.
          </h1>
          <p className="mt-3 text-dark-300">
            Drag and drop your latest resume. We will parse sections, extract skills, and prepare it for
            ATS optimization in the editor.
          </p>

          <div
            {...getRootProps()}
            id="dropzone"
            className={`mt-7 cursor-pointer rounded-3xl border border-dashed p-8 text-center transition-all duration-300
              ${isDragActive
                ? 'border-cyan-300 bg-cyan-400/10 scale-[1.01]'
                : file
                  ? 'border-emerald-400/60 bg-emerald-500/10'
                  : 'border-dark-600/80 bg-dark-900/60 hover:border-cyan-300/50 hover:bg-cyan-400/5'
              }`}
          >
            <input {...getInputProps()} id="file-input" />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dark-600/80 bg-dark-900/70">
                {getFileIcon()}
              </div>

              {file ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">File selected</span>
                  </div>
                  <p className="max-w-full truncate text-sm text-dark-200">{file.name}</p>
                  <p className="text-xs text-dark-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-dark-100">
                    {isDragActive ? 'Drop file here' : 'Drop your resume or click to browse'}
                  </p>
                  <p className="text-sm text-dark-400">Supported: PDF, DOCX up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {!parsedResume && (
            <button
              id="upload-btn"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-3"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark-950/30 border-t-dark-950" />
                  Parsing resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Parse with AI
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {uploading && (
            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-cyan-100">Extracting sections and skills</span>
                <span className="font-semibold text-cyan-300">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-dark-900/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          {parsedResume ? (
            <article className="panel-card border-emerald-400/30 bg-emerald-500/10 p-6 animate-slide-up">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/15 p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-dark-50">Resume parsed successfully</h2>
                  <p className="text-sm text-dark-300">Review and continue to the editor.</p>
                </div>
              </div>

              <dl className="space-y-3 rounded-2xl border border-dark-700/70 bg-dark-900/65 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-dark-400">Candidate name</dt>
                  <dd className="truncate font-medium text-dark-100">
                    {parsedResume.sections?.personalInfo?.name || 'Not detected'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-dark-400">Contact email</dt>
                  <dd className="truncate font-medium text-dark-100">
                    {parsedResume.sections?.personalInfo?.email || 'Not detected'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-dark-400">Extracted skills</dt>
                  <dd className="font-medium text-dark-100">
                    {parsedResume.sections?.skills?.length || 0}
                  </dd>
                </div>
              </dl>

              <button
                id="save-db-btn"
                onClick={handleSaveToDB}
                className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3"
              >
                <Shield className="h-4 w-4" />
                Save and open editor
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ) : (
            <article className="panel-card p-6">
              <h2 className="font-display text-2xl font-semibold text-dark-50">What happens next</h2>
              <ol className="mt-4 space-y-3 text-sm text-dark-300">
                <li className="flex items-start gap-3">
                  <span className="pill mt-0.5">1</span>
                  Parse sections like summary, experience, education, and skills.
                </li>
                <li className="flex items-start gap-3">
                  <span className="pill mt-0.5">2</span>
                  Fine-tune content in the editor with autosave and job match analysis.
                </li>
                <li className="flex items-start gap-3">
                  <span className="pill mt-0.5">3</span>
                  Export polished DOCX or PDF and optionally email to yourself.
                </li>
              </ol>
            </article>
          )}

          <article className="panel-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 p-2">
                <Shield className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-100">Privacy</h3>
                <p className="text-sm text-dark-400">Files are processed securely for your account session.</p>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
