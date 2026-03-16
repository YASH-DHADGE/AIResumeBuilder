import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useResume from '../hooks/useResume';
import ResumeEditor from '../components/ResumeEditor';
import SkillsPanel from '../components/SkillsPanel';
import ATSScoreCard from '../components/ATSScoreCard';
import {
  Sparkles, ArrowLeft, Download, Loader2, Save,
} from 'lucide-react';

export default function EditorPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { resume, loading, saving, analyzing, updateSection, runAnalysis } = useResume(resumeId);

  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);
  
  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-dark-300">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Resume not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              id="back-btn"
              onClick={() => navigate('/upload')}
              className="text-dark-400 hover:text-dark-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <span className="font-semibold text-dark-100">
                {resume.sections?.personalInfo?.name || resume.originalFileName}
              </span>
            </div>
            {saving && (
              <div className="flex items-center gap-1.5 text-dark-400 text-sm">
                <Save className="w-4 h-4 animate-pulse" />
                Saving...
              </div>
            )}
          </div>

          <button
            id="download-nav-btn"
            onClick={() => navigate(`/download/${resumeId}`)}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-6">
        {/* Left: Editor */}
        <div className="space-y-6 animate-fade-in">
          <ResumeEditor
            sections={resume.sections}
            onUpdateSection={updateSection}
          />
        </div>

        {/* Right: Sidebar */}
        <aside className="space-y-6 animate-slide-up">
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
      </div>
    </div>
  );
}
