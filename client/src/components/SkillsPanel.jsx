import { useState } from 'react';
import { patchSkills } from '../services/api';
import toast from 'react-hot-toast';
import { Code2, Plus, X, Check, AlertCircle } from 'lucide-react';

export default function SkillsPanel({
  skills,
  matchedSkills,
  missingSkills,
  resumeId,
  onUpdateSection,
}) {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = async (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error('Skill already exists');
      return;
    }

    try {
      await patchSkills(resumeId, [trimmed], []);
      onUpdateSection('skills', [...skills, trimmed]);
      setNewSkill('');
      toast.success(`Added: ${trimmed}`);
    } catch (err) {
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await patchSkills(resumeId, [], [skill]);
      onUpdateSection('skills', skills.filter((s) => s !== skill));
    } catch (err) {
      toast.error('Failed to remove skill');
    }
  };

  const isMatched = (skill) =>
    matchedSkills.some((ms) => ms.toLowerCase() === skill.toLowerCase());

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-dark-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="font-semibold text-dark-100">Skills</h3>
          <span className="ml-auto text-xs text-dark-500 bg-dark-700 px-2 py-0.5 rounded-full">
            {skills.length}
          </span>
        </div>

        {/* Add skill input */}
        <div className="flex gap-2">
          <input
            id="new-skill-input"
            className="input-field flex-1 text-sm"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSkill(newSkill);
            }}
            placeholder="Add a new skill..."
          />
          <button
            id="add-skill-btn"
            onClick={() => handleAddSkill(newSkill)}
            className="w-10 h-10 bg-primary-600 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Skills list */}
      <div className="p-5 space-y-2 max-h-[400px] overflow-y-auto">
        {skills.length === 0 ? (
          <p className="text-dark-500 text-sm text-center py-4">
            No skills yet. Add your first skill above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${isMatched(skill)
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-dark-700/50 text-dark-200 border border-dark-600'
                  }`}
              >
                {isMatched(skill) && <Check className="w-3 h-3" />}
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-0.5 text-dark-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Missing skills section */}
        {missingSkills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-700/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                Missing Skills ({missingSkills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                    bg-red-500/10 text-red-400 border border-red-500/20
                    hover:bg-red-500/20 transition-all cursor-pointer group"
                >
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
