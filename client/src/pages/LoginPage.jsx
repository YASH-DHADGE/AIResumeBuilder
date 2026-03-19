import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LogIn,
  Sparkles,
  Target,
  UserPlus,
  Wand2,
} from 'lucide-react';

const FEATURE_LIST = [
  {
    icon: FileText,
    title: 'Parse in Seconds',
    desc: 'Upload PDF or DOCX resumes and map them into editable sections instantly.',
  },
  {
    icon: Target,
    title: 'Boost ATS Match',
    desc: 'Compare resume skills against real job descriptions and fill missing gaps fast.',
  },
  {
    icon: Wand2,
    title: 'Export Ready',
    desc: 'Generate clean DOCX and PDF exports with one click for applications.',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = isRegister
        ? await registerUser(form)
        : await loginUser({ email: form.email, password: form.password });

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      toast.success(data.message);
      navigate('/upload');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-wrap py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="panel-card-strong relative overflow-hidden p-6 sm:p-10">
            <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="brand-mark h-12 w-12 rounded-2xl">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Career Workspace</p>
                  <h1 className="font-display text-2xl font-bold gradient-text sm:text-3xl">AI Resume Builder</h1>
                </div>
              </div>

              <h2 className="font-display text-3xl font-semibold leading-tight text-dark-50 sm:text-4xl">
                Build a resume that matches what recruiters actually scan.
              </h2>
              <p className="mt-4 max-w-xl text-dark-300">
                Sign in to parse your resume, optimize it against job descriptions, and export polished
                versions for every application.
              </p>

              <div className="mt-8 space-y-4">
                {FEATURE_LIST.map(({ icon: Icon, title, desc }) => (
                  <article
                    key={title}
                    className="flex items-start gap-3 rounded-2xl border border-dark-700/70 bg-dark-900/45 p-4"
                  >
                    <div className="mt-0.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-2">
                      <Icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-50">{title}</h3>
                      <p className="mt-1 text-sm text-dark-400">{desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="panel-card p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between">
              <span className="section-kicker">Account Access</span>
              <button
                id="toggle-auth-mode"
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="btn-ghost px-3 py-1.5"
              >
                {isRegister ? 'Already joined? Sign in' : 'New here? Create account'}
              </button>
            </div>

            <h2 className="font-display text-3xl font-semibold text-dark-50">
              {isRegister ? 'Create your workspace' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-dark-400">
              {isRegister
                ? 'Set up your account to start optimizing resumes with AI.'
                : 'Sign in to continue where you left off.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" id="auth-form">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark-300">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    autoComplete="name"
                    className="input-field w-full"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-dark-300">Email</label>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  className="input-field w-full"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-dark-300">Password</label>
                <input
                  id="password-input"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="input-field w-full"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary mt-3 flex w-full items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark-950/30 border-t-dark-950" />
                    Working...
                  </>
                ) : isRegister ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-dark-700/70 bg-dark-900/50 p-4 text-sm text-dark-400">
              <p className="flex items-center gap-2 text-dark-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Your data stays private and tied to your account session.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
