import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { analyzeAtsScore, analyzeEnhancements } from '../services/api';

const JobAnalysisContext = createContext(null);

export const useJobAnalysis = () => {
  const context = useContext(JobAnalysisContext);
  if (!context) {
    throw new Error('useJobAnalysis must be used within a JobAnalysisProvider');
  }
  return context;
};

export const JobAnalysisProvider = ({ children, resumeId, onUpdateSection, currentSections }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [analysisStatus, setAnalysisStatus] = useState('idle'); // 'idle' | 'loading' | 'complete' | 'error'

  const [atsScore, setAtsScore] = useState(null);
  const [enhancements, setEnhancements] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);

  const [appliedEnhancements, setAppliedEnhancements] = useState(new Set());

  const [coverLetterParams, setCoverLetterParams] = useState({
    tone: 'Professional',
    length: 'Standard',
    style: 'Story-driven',
    format: 'Modern',
  });

  const [coverLetterHistory, setCoverLetterHistory] = useState([]);

  const runFullAnalysis = useCallback(async (resumeData, jd, title, company) => {
    if (!jd || jd.length < 100) {
      toast.error('Job description is too short. Minimum 100 characters required.');
      return;
    }
    
    setJobDescription(jd);
    setJobTitle(title);
    setCompanyName(company);
    setAnalysisStatus('loading');

    try {
      const [atsResponse, enhanceResponse] = await Promise.all([
        analyzeAtsScore({ resumeId, jobDescription: jd }),
        analyzeEnhancements({ resumeId, jobDescription: jd, jobTitle: title, companyName: company }),
      ]);

      setAtsScore(atsResponse.data.data);
      setEnhancements(enhanceResponse.data.data);
      setAnalysisStatus('complete');
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Job analysis error:', error);
      setAnalysisStatus('error');
      const errorMsg = error.response?.data?.message || 'Failed to run job analysis. Please try again.';
      toast.error(errorMsg);
    }
  }, [resumeId]);

  const markEnhancementApplied = useCallback((id) => {
    setAppliedEnhancements((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });
  }, []);

  const applyEnhancement = useCallback((section, item, customText = null) => {
    if (!onUpdateSection || !currentSections) {
      toast.error('Cannot apply changes in this view.');
      return false;
    }

    const textToApply = customText || item.suggested_text;
    const { location_id, sub_id } = item;
    
    try {
      if (section === 'summary') {
        onUpdateSection('summary', textToApply);
        markEnhancementApplied(item.location + item.suggested_text.substring(0, 10));
        return true;
      }
      
      const updatedSectionData = JSON.parse(JSON.stringify(currentSections[section] || []));
      const idx = parseInt(location_id);
      
      if (isNaN(idx) || !updatedSectionData[idx]) {
        // Fallback: search by text if indices are missing/wrong
        if (section === 'experience') {
           for (let i = 0; i < updatedSectionData.length; i++) {
             const bulletIdx = updatedSectionData[i].bullets?.findIndex(b => b.includes(item.current_text));
             if (bulletIdx > -1) {
               updatedSectionData[i].bullets[bulletIdx] = textToApply;
               onUpdateSection(section, updatedSectionData);
               markEnhancementApplied(item.location + item.suggested_text.substring(0, 10));
               return true;
             }
           }
        }
        return false;
      }
      
      const target = updatedSectionData[idx];
      if (section === 'experience' && sub_id !== null) {
        const bulletIdx = parseInt(sub_id);
        if (target.bullets && target.bullets[bulletIdx] !== undefined) {
          target.bullets[bulletIdx] = textToApply;
          onUpdateSection(section, updatedSectionData);
          markEnhancementApplied(item.location + item.suggested_text.substring(0, 10));
          return true;
        }
      } else if (section === 'projects' && (sub_id === 'description' || sub_id === 'bullets')) {
          if (Array.isArray(target.bullets)) {
              const bIdx = parseInt(sub_id === 'bullets' ? 0 : sub_id); // basic mapping
              target.bullets[bIdx] = textToApply;
          } else {
              target.description = textToApply;
          }
          onUpdateSection(section, updatedSectionData);
          markEnhancementApplied(item.location + item.suggested_text.substring(0, 10));
          return true;
      }
    } catch (err) {
      console.error('Apply enhancement error:', err);
      toast.error('Selection mismatch. Try manual edit.');
    }
    
    return false;
  }, [onUpdateSection, currentSections, markEnhancementApplied]);

  const clearAnalysis = useCallback(() => {
    setJobDescription('');
    setJobTitle('');
    setCompanyName('');
    setAtsScore(null);
    setEnhancements(null);
    setCoverLetter(null);
    setAppliedEnhancements(new Set());
    setCoverLetterHistory([]);
    setAnalysisStatus('idle');
  }, []);

  return (
    <JobAnalysisContext.Provider
      value={{
        jobDescription,
        setJobDescription,
        jobTitle,
        setJobTitle,
        companyName,
        setCompanyName,
        analysisStatus,
        atsScore,
        enhancements,
        coverLetter,
        setCoverLetter,
        appliedEnhancements,
        markEnhancementApplied,
        coverLetterParams,
        setCoverLetterParams,
        coverLetterHistory,
        setCoverLetterHistory,
        resumeId,
        runFullAnalysis,
        clearAnalysis,
        applyEnhancement,
      }}
    >
      {children}
    </JobAnalysisContext.Provider>
  );
};
