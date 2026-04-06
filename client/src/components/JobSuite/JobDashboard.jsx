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

  return (
    <div className="mb-12 flex h-full flex-col animate-slide-up">
      <JobInputHub resumeData={resume?.sections} />

      <div className="panel-card flex min-h-[500px] flex-1 flex-col rounded-[1.5rem] p-5">
        
        {/* Tabs */}
        <div className="mb-5 flex w-full items-center gap-2 overflow-x-auto border-b border-dark-700 pb-4">
          <button
            onClick={() => setActiveTab('ats')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'ats' 
              ? 'bg-orange-200/10 text-orange-100' 
              : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            ATS Score
          </button>
          <button
            onClick={() => setActiveTab('enhance')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'enhance' 
              ? 'bg-orange-200/10 text-orange-100' 
              : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Enhancements
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'cover' 
              ? 'bg-orange-200/10 text-orange-100' 
              : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200'
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
