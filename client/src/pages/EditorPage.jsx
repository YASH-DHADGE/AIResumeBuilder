import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useResume from '../hooks/useResume';
import ResumeEditor from '../components/ResumeEditor';
import SkillsPanel from '../components/SkillsPanel';
import ATSScoreCard from '../components/ATSScoreCard';
import {
  ArrowLeft,
  Download,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  getAuthToken,
  getDisplayName,
  getStoredUser,
  getUserInitial,
  requireAuth,
} from '../utils/auth';

export default function EditorPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { resume, loading, saving, analyzing, updateSection, runAnalysis, saveNow } = useResume(resumeId);

  useEffect(() => {
    requireAuth(navigate);
  }, [navigate]);

  const token = getAuthToken();
  if (!token) return null;

  const user = getStoredUser();
  const userName = getDisplayName(user);
  const userInitial = getUserInitial(user);

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="panel-card flex items-center gap-3 px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          <p className="text-sm text-dark-300">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="app-shell flex items-center justify-center px-6">
        <div className="panel-card w-full max-w-md p-6 text-center">
          <p className="text-dark-300">Resume not found.</p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-secondary mt-4"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col">
      <header className="sticky top-0 z-50 border-b border-dark-700/70 bg-dark-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              id="back-btn"
              onClick={() => navigate('/upload')}
              className="btn-ghost flex items-center gap-2 px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <div className="brand-mark h-9 w-9 rounded-xl">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-dark-50">
                  {resume.sections?.personalInfo?.name || resume.originalFileName}
                </p>
                <p className="truncate text-xs text-dark-400">Editing as {userName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="save-nav-btn"
              onClick={() => saveNow(resume.sections)}
              disabled={saving}
              className="btn-secondary flex items-center gap-2 px-3 py-2"
            >
              <Save className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              id="profile-nav-btn"
              onClick={() => navigate('/profile')}
              className="btn-secondary flex items-center gap-2 px-3 py-2"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
                {userInitial}
              </span>
              <span className="hidden sm:inline">Profile</span>
            </button>

            <button
              id="download-nav-btn"
              onClick={() => navigate(`/download/${resumeId}`)}
              className="btn-primary flex items-center gap-2 px-3 py-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_380px] sm:px-6">
        <section className="space-y-4 animate-fade-in">
          {saving && (
            <div className="pill border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
              Saving your latest changes...
            </div>
          )}
          <ResumeEditor sections={resume.sections} onUpdateSection={updateSection} />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit animate-slide-up">
          <ATSScoreCard
            atsScore={resume.atsScore}
            matchedSkills={resume.matchedSkills}
            missingSkills={resume.missingSkills}
            analyzing={analyzing}
            onAnalyze={runAnalysis}
          />
          <SkillsPanel
            skills={resume.sections?.skills || []}
            matchedSkills={resume.matchedSkills || []}
            missingSkills={resume.missingSkills || []}
            resumeId={resumeId}
            onUpdateSection={updateSection}
          />
        </aside>
      </main>
    </div>
  );
}
