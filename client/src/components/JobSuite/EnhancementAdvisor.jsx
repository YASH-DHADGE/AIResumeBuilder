import React, { useState } from 'react';
import { useJobAnalysis } from '../../context/JobAnalysisContext';
import { useOutletContext } from 'react-router-dom';
import { Check, Edit3, X, ArrowRight, Wand2, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnhancementAdvisor() {
  const { enhancements, appliedEnhancements, markEnhancementApplied, applyEnhancement, analysisStatus } = useJobAnalysis();
  const [activeSection, setActiveSection] = useState('experience');
  
  // Update active section when enhancements are loaded
  React.useEffect(() => {
    if (enhancements?.sections?.[0]?.section) {
      setActiveSection(enhancements.sections[0].section);
    }
  }, [enhancements]);
  
  // Customization state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editText, setEditText] = useState('');

  if (analysisStatus === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-dark-400">
        <Zap className="h-12 w-12 mb-4 opacity-50" />
        <p>Paste a job description to unlock tailored resume improvements.</p>
      </div>
    );
  }
  
  if (!enhancements || !enhancements.sections) {
    return <p className="text-dark-400">No enhancements available.</p>;
  }

  const sections = enhancements.sections;
  const currentSectionData = sections.find(s => s.section === activeSection);
  const items = currentSectionData?.items || [];

  const handleCustomize = (item) => {
    setEditingItemId(item.location + item.suggested_text.substring(0,10)); // pseudo ID
    setEditText(item.suggested_text);
  };

  const handleApplyAllHigh = async () => {
    const highPriorityItems = enhancements.sections.flatMap(sec => 
      (sec.items || []).filter(item => item.priority === 'HIGH' || item.priority === 'Critical')
        .map(item => ({ section: sec.section, item }))
    );

    let appliedCount = 0;
    for (const { section, item } of highPriorityItems) {
        const itemId = item.location + item.suggested_text.substring(0, 10);
        if (!appliedEnhancements.has(itemId)) {
            const success = await applyEnhancement(section, item);
            if (success) appliedCount++;
        }
    }
    
    if (appliedCount > 0) {
        toast.success(`Applied ${appliedCount} high-priority improvements!`);
    } else {
        toast.error('No pending high-priority improvements found.');
    }
  };

  const handleApply = async (item, customText = null) => {
    const success = await applyEnhancement(activeSection, item, customText);
    if (success) {
      setEditingItemId(null);
      toast.success('Improvement applied!');
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'HIGH' || priority === 'Critical') return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (priority === 'MEDIUM') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold text-dark-50">Resume Enhancements</h3>
          <p className="text-sm text-dark-400">Tailored for: <span className="text-dark-200">{enhancements.target_role || 'This Role'}</span></p>
        </div>
        <button 
            onClick={handleApplyAllHigh}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
        >
          <Wand2 className="h-3.5 w-3.5" /> Apply All High Priority
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-dark-700/50 pb-2 overflow-x-auto custom-scrollbar">
        {sections.map(sec => (
          <button
            key={sec.section}
            onClick={() => setActiveSection(sec.section)}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
              activeSection === sec.section 
              ? 'bg-dark-800 text-cyan-300 font-medium' 
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
            }`}
          >
            {sec.section.charAt(0).toUpperCase() + sec.section.slice(1)} 
            <span className="ml-1.5 rounded-full bg-dark-700 px-1.5 py-0.5 text-[10px]">
              {sec.improvements_count || sec.items?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Enhancements List */}
      <div className="space-y-4 pb-4">
        {items.map((item, idx) => {
          const itemId = item.location + item.suggested_text.substring(0,10);
          const isApplied = appliedEnhancements.has(itemId);
          const isEditing = editingItemId === itemId;

          return (
            <div key={idx} className={`rounded-xl border p-4 transition-all ${
              isApplied ? 'bg-dark-800/30 border-emerald-500/30 opacity-70' : 'bg-dark-800/60 border-dark-600'
            }`}>
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${getPriorityColor(item.priority)}`}>
                    {item.priority} PRIORITY
                  </span>
                  <p className="text-xs text-dark-400 mt-2 font-medium">Location: {item.location}</p>
                </div>
                {isApplied && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Applied
                  </span>
                )}
              </div>

              {/* Before/After View */}
              {!isEditing && (
                <div className="space-y-3 mb-4">
                  {item.current_text && (
                    <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                      <span className="text-[10px] font-bold text-red-400 uppercase mb-1 block">Current:</span>
                      <p className="text-sm text-dark-300 line-through decoration-red-500/40">{item.current_text}</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 relative">
                    <Sparkles className="absolute top-2 right-2 h-4 w-4 text-emerald-400/40" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase mb-1 block">Suggested:</span>
                    <p className="text-sm text-dark-100">{item.suggested_text}</p>
                    
                    {item.keywords_added && item.keywords_added.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/10 flex flex-wrap gap-1">
                        <span className="text-[10px] text-emerald-500/70 mr-1">Added:</span>
                        {item.keywords_added.map((kw, i) => (
                          <span key={i} className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1 rounded">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Edit View */}
              {isEditing && (
                <div className="mb-4 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Customize Suggestion:</span>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-lg border border-cyan-500/30 bg-dark-900 p-3 text-sm text-dark-50 outline-none focus:border-cyan-400 flex-1 resize-y"
                    rows={4}
                  />
                </div>
              )}

              {item.reasoning && !isEditing && (
                <p className="text-xs text-dark-400 mb-4 border-l-2 border-cyan-500/30 pl-2">
                  <span className="font-semibold text-dark-300">Why: </span>{item.reasoning}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-dark-700/50">
                {!isApplied ? (
                  isEditing ? (
                    <>
                      <button onClick={() => handleApply(item, editText)} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> Save & Apply
                      </button>
                      <button onClick={() => setEditingItemId(null)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleApply(item)} className="btn-secondary py-1.5 px-4 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30">
                        Use This Version
                      </button>
                      <button onClick={() => handleCustomize(item)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" /> Customize
                      </button>
                    </>
                  )
                ) : (
                  <button onClick={() => setEditingItemId(null)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 text-emerald-400">
                    Applied Successfully
                  </button>
                )}
              </div>

            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-dark-400 italic py-4">No improvements suggested for this section.</p>
        )}
      </div>
    </div>
  );
}
