/**
 * useResume hook — Manages resume state, fetching, and autosave
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getResume, updateSections, analyzeJob } from '../services/api';
import toast from 'react-hot-toast';

export default function useResume(resumeId) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const debounceRef = useRef(null);

  // Fetch resume on mount
  useEffect(() => {
    if (!resumeId) return;

    let cancelled = false;
    setLoading(true);

    getResume(resumeId)
      .then(({ data }) => {
        if (!cancelled) {
          setResume(data.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err.response?.data?.message || 'Failed to load resume');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [resumeId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Debounced autosave
  const autoSave = useCallback(
    (updatedSections) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const { data } = await updateSections(resumeId, updatedSections);
          setResume(data.data);
        } catch (err) {
          toast.error('Failed to save changes');
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    [resumeId]
  );

  // Manual save
  const saveNow = useCallback(async (currentSections) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaving(true);
    try {
      const { data } = await updateSections(resumeId, currentSections);
      setResume(data.data);
      toast.success('Saved successfully', { id: 'manual-save' });
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [resumeId]);

  // Update a specific section
  const updateSection = useCallback(
    (sectionKey, value) => {
      setResume((prev) => {
        const updated = {
          ...prev,
          sections: { ...prev.sections, [sectionKey]: value },
        };
        autoSave(updated.sections);
        return updated;
      });
    },
    [autoSave]
  );

  // Analyze a job description
  const runAnalysis = useCallback(
    async (jobDescription) => {
      setAnalyzing(true);
      try {
        const { data } = await analyzeJob(jobDescription, resumeId);
        setResume((prev) => ({
          ...prev,
          atsScore: data.data.atsScore,
          matchedSkills: data.data.matchedSkills,
          missingSkills: data.data.missingSkills,
          lastJobDescription: jobDescription,
        }));
        toast.success(`ATS Score: ${data.data.atsScore}%`);
        return data.data;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Analysis failed');
        throw err;
      } finally {
        setAnalyzing(false);
      }
    },
    [resumeId]
  );

  return {
    resume,
    loading,
    saving,
    analyzing,
    updateSection,
    runAnalysis,
    saveNow,
    setResume,
  };
}
