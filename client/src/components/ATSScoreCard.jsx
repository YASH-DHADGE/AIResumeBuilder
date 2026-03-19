import { useState, useEffect, useRef } from 'react';
import { Target, Loader2, Search } from 'lucide-react';

export default function ATSScoreCard({
  atsScore,
  matchedSkills,
  missingSkills,
  analyzing,
  onAnalyze,
}) {
  const [jobDescription, setJobDescription] = useState('');
  const [animatedScore, setAnimatedScore] = useState(0);
  const animRef = useRef(null);

  // Animate score counting up
  useEffect(() => {
    if (atsScore == null) return;

    const duration = 1500; // ms
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(startValue + (atsScore - startValue) * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [atsScore]);

  const getScoreColor = (score) => {
    if (score >= 75) return { text: 'text-green-400', ring: 'stroke-green-400', bg: 'bg-green-400' };
    if (score >= 50) return { text: 'text-yellow-400', ring: 'stroke-yellow-400', bg: 'bg-yellow-400' };
    return { text: 'text-red-400', ring: 'stroke-red-400', bg: 'bg-red-400' };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Strong match';
    if (score >= 65) return 'Good potential';
    if (score >= 50) return 'Needs tuning';
    return 'Low match';
  };

  const scoreColor = getScoreColor(animatedScore);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (circumference * animatedScore) / 100;

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    onAnalyze(jobDescription);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-dark-700/60 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
            <Target className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-100">ATS Score</h3>
            <p className="text-xs text-dark-400">Analyze the role description to score alignment.</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {atsScore != null && (
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-dark-700"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={scoreColor.ring}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor.text}`}>
                  {animatedScore}
                </span>
                <span className="text-dark-500 text-xs uppercase tracking-[0.16em]">
                  ATS Score
                </span>
              </div>
            </div>
          </div>
        )}

        {atsScore != null && (
          <>
            <p className={`mb-4 text-center text-sm font-semibold ${scoreColor.text}`}>
              {getScoreLabel(animatedScore)}
            </p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-green-300">
                  {matchedSkills?.length || 0}
                </p>
                <p className="text-xs text-dark-400">Matched</p>
              </div>
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-red-300">
                  {missingSkills?.length || 0}
                </p>
                <p className="text-xs text-dark-400">Missing</p>
              </div>
            </div>
          </>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-dark-400">
              Job Description
            </label>
            <span className="text-xs text-dark-500">{jobDescription.trim().length} chars</span>
          </div>
          <textarea
            id="job-description-textarea"
            className="input-field w-full resize-none text-sm"
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here to analyze skill fit..."
          />
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={analyzing || !jobDescription.trim()}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing match...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Match
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
