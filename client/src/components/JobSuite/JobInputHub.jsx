import React, { useState } from 'react';
import { useJobAnalysis } from '../../context/JobAnalysisContext';
import { Briefcase, Building, FileText, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export default function JobInputHub({ resumeData }) {
  const { runFullAnalysis, analysisStatus, jobDescription, jobTitle, companyName, setJobDescription, setJobTitle, setCompanyName } = useJobAnalysis();
  
  const [localJobTitle, setLocalJobTitle] = useState(jobTitle);
  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [localJd, setLocalJd] = useState(jobDescription);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const wordCount = localJd.trim() ? localJd.trim().split(/\s+/).length : 0;
  const isEnabled = localJd.length >= 100;
  const isLoading = analysisStatus === 'loading';

  const handleAnalyze = () => {
    if (isEnabled && !isLoading) {
      runFullAnalysis(resumeData, localJd, localJobTitle, localCompanyName);
      setIsCollapsed(true);
    }
  };

  return (
    <div className="rounded-xl border border-dark-700/70 bg-dark-900/50 p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <h3 className="font-display text-lg font-semibold text-dark-50">Target Job</h3>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-dark-400 hover:text-dark-200 transition-colors"
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-4 animate-fade-in cursor-default">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-300 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Job Title
              </label>
              <input
                type="text"
                value={localJobTitle}
                onChange={(e) => setLocalJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-lg border border-dark-600 bg-dark-800/80 px-4 py-2 text-sm text-dark-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-300 flex items-center gap-2">
                <Building className="h-4 w-4" /> Company
              </label>
              <input
                type="text"
                value={localCompanyName}
                onChange={(e) => setLocalCompanyName(e.target.value)}
                placeholder="e.g. Stripe"
                className="w-full rounded-lg border border-dark-600 bg-dark-800/80 px-4 py-2 text-sm text-dark-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-dark-300 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Job Description
              </label>
              <span className={`text-xs ${localJd.length < 100 && localJd.length > 0 ? 'text-amber-400' : 'text-dark-400'}`}>
                {localJd.length} chars · ~{wordCount} words
              </span>
            </div>
            <textarea
              value={localJd}
              onChange={(e) => setLocalJd(e.target.value)}
              placeholder="Paste the full job description here... (Minimum 100 characters)"
              rows={6}
              className="w-full rounded-lg border border-dark-600 bg-dark-800/80 p-4 text-sm text-dark-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-y"
            />
            {localJd.length > 0 && localJd.length < 100 && (
              <p className="mt-1 text-xs text-amber-400">Please enter at least 100 characters.</p>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!isEnabled || isLoading}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              !isEnabled || isLoading
                ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-dark-950 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-dark-950 border-t-transparent animate-spin"></span>
                Analyzing Job...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Analyze Resume <Sparkles className="h-4 w-4" />
              </span>
            )}
          </button>
        </div>
      )}
      
      {isCollapsed && localJd && (
        <div className="text-sm text-dark-400 truncate">
          <span className="font-medium text-dark-200">{localJobTitle || 'Untitled Role'}</span> at <span className="font-medium text-dark-200">{localCompanyName || 'Company'}</span> — {wordCount} words
        </div>
      )}
    </div>
  );
}
