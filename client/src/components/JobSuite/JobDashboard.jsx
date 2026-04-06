import React, { useState } from 'react';
import JobInputHub from './JobInputHub';
import AtsScorePanel from './AtsScorePanel';
import EnhancementAdvisor from './EnhancementAdvisor';
import CoverLetterGenerator from './CoverLetterGenerator';
import { useJobAnalysis } from '../../context/JobAnalysisContext';
import { BarChart3, Sparkles, Mail } from 'lucide-react';

export default function JobDashboard({ resume }) {
  const { analysisStatus } = useJobAnalysis();
  const [activeTab, setActiveTab] = useState('ats'); // ats, enhance, cover

  // Safe checks
  const isReady = analysisStatus === 'complete';
  const showContent = analysisStatus !== 'idle';

  return (
    <div className="flex flex-col h-full animate-slide-up mb-12">
      <JobInputHub resumeData={resume?.sections} />

      <div className="rounded-xl border border-dark-700/70 bg-dark-900/50 p-5 shadow-lg flex-1 flex flex-col min-h-[500px]">
        
        {/* Tabs */}
        <div className="flex w-full items-center gap-2 border-b border-dark-700 pb-4 mb-5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ats')}
            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ats' 
              ? 'bg-dark-800 text-cyan-400' 
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            ATS Score
          </button>
          <button
            onClick={() => setActiveTab('enhance')}
            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'enhance' 
              ? 'bg-dark-800 text-cyan-400' 
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Enhancements
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'cover' 
              ? 'bg-dark-800 text-cyan-400' 
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
            }`}
          >
            <Mail className="h-4 w-4" />
            Cover Letter
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === 'ats' && <AtsScorePanel />}
          {activeTab === 'enhance' && <EnhancementAdvisor />}
          {activeTab === 'cover' && <CoverLetterGenerator resumeData={resume?.sections} />}
        </div>
        
      </div>
    </div>
  );
}
