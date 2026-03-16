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

  const scoreColor = getScoreColor(animatedScore);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (circumference * animatedScore) / 100;

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    onAnalyze(jobDescription);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500/10 border border-primary-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-400" />
          </div>
          <h3 className="font-semibold text-dark-100">ATS Score</h3>
        </div>
      </div>

      <div className="p-5">
        {/* Score circle */}
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
                <span className="text-dark-500 text-xs uppercase tracking-wider">
                  ATS Score
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {atsScore != null && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">
                {matchedSkills?.length || 0}
              </p>
              <p className="text-xs text-dark-400">Matched</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-400">
                {missingSkills?.length || 0}
              </p>
              <p className="text-xs text-dark-400">Missing</p>
            </div>
          </div>
        )}

        {/* Job description input */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">
            Paste Job Description
          </label>
          <textarea
            id="job-description-textarea"
            className="input-field w-full text-sm resize-none"
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to analyze skill match..."
          />
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={analyzing || !jobDescription.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Match
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
