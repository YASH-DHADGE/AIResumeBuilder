import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, putUserProfile } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Award,
  Code2,
  Loader2,
  LogOut,
  Mail,
  PencilLine,
  Save,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import ResumeEditor from '../components/ResumeEditor';
import {
  clearSession,
  getAuthToken,
  getDisplayName,
  getStoredUser,
  getUserInitial,
  requireAuth,
} from '../utils/auth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requireAuth(navigate)) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setProfile(data.data);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const token = getAuthToken();
  if (!token) return null;

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="panel-card flex items-center gap-3 px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          <span className="text-sm text-dark-200">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-shell flex items-center justify-center px-6">
        <div className="panel-card w-full max-w-md p-6 text-center">
          <p className="text-dark-300">We could not load your profile right now.</p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-secondary mt-5"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const localUser = getStoredUser();
  const displayName = getDisplayName(localUser || profile);
  const userInitial = getUserInitial(localUser || profile);
  const skills = profile?.skills || [];

  const handleUpdateSection = (sectionKey, value) => {
    setProfile((prev) => ({
      ...prev,
      [sectionKey]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        personalInfo: profile.personalInfo,
        summary: profile.summary,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
      };
      await putUserProfile(payload);
      toast.success('Profile saved successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-50 border-b border-dark-700/70 bg-dark-950/75 backdrop-blur-xl">
        <div className="page-wrap flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="btn-ghost flex items-center gap-2 px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="brand-mark h-9 w-9 rounded-xl">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-semibold text-dark-100">Profile</span>
            </div>
          </div>

          <button
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
      </header>

      <main className="page-wrap py-8 animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="panel-card-strong overflow-hidden">
            <div className="border-b border-dark-700/70 bg-gradient-to-r from-blue-500/30 to-cyan-400/20 px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-2xl font-bold text-cyan-200">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Global profile</p>
                    <h1 className="font-display text-2xl font-semibold text-dark-50">{displayName}</h1>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-dark-300">
                      <Mail className="h-4 w-4" />
                      {profile?.email || localUser?.email || 'No email available'}
                    </p>
                  </div>
                </div>

                <div className="pill flex items-center gap-1.5 border-amber-300/30 bg-amber-300/10 text-amber-200">
                  <Award className="h-4 w-4" />
                  {skills.length} skills tracked
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm text-dark-400">
                Your profile acts as the master record. Uploading a new resume refreshes sections so your
                latest details stay in sync.
              </p>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit profile sections
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save changes
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="panel-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 p-2.5">
                <Code2 className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-dark-50">Skill inventory</h2>
                <p className="text-sm text-dark-400">Combined from your parsed resumes and extension updates.</p>
              </div>
            </div>

            {skills.length === 0 ? (
              <p className="rounded-2xl border border-dark-700/70 bg-dark-900/60 px-4 py-6 text-center text-sm text-dark-400">
                No skills yet. Upload a resume or add missing skills from job analysis.
              </p>
            ) : (
              <div className="flex max-h-[380px] flex-wrap gap-2 overflow-y-auto rounded-2xl border border-dark-700/70 bg-dark-900/60 p-4">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-xl border border-dark-600/80 bg-dark-800/80 px-3 py-1.5 text-sm text-dark-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        {isEditing && (
          <section className="panel-card mt-6 p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-300" />
              <h2 className="font-display text-xl font-semibold text-dark-50">Edit global profile sections</h2>
            </div>
            <ResumeEditor sections={profile} onUpdateSection={handleUpdateSection} />
          </section>
        )}
      </main>
    </div>
  );
}
