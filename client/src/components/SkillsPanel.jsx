import { useMemo, useState } from 'react';
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

  const normalizedSkills = useMemo(
    () => skills.map((skill) => skill.toLowerCase()),
    [skills]
  );

  const filteredMissingSkills = useMemo(
    () =>
      missingSkills.filter(
        (skill) => !normalizedSkills.includes(skill.toLowerCase())
      ),
    [missingSkills, normalizedSkills]
  );

  const handleAddSkill = async (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return false;

    if (normalizedSkills.includes(trimmed.toLowerCase())) {
      toast.error('Skill already exists');
      return false;
    }

    try {
      await patchSkills(resumeId, [trimmed], []);
      onUpdateSection('skills', [...skills, trimmed]);
      setNewSkill('');
      toast.success(`Added: ${trimmed}`);
      return true;
    } catch {
      toast.error('Failed to add skill');
      return false;
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await patchSkills(resumeId, [], [skill]);
      onUpdateSection('skills', skills.filter((s) => s !== skill));
      toast.success(`Removed: ${skill}`);
    } catch {
      toast.error('Failed to remove skill');
    }
  };

  const isMatched = (skill) =>
    matchedSkills.some((ms) => ms.toLowerCase() === skill.toLowerCase());

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-dark-700/60 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-300/10">
            <Code2 className="h-5 w-5 text-teal-200" />
          </div>
          <h3 className="font-semibold text-dark-100">Skills</h3>
          <span className="ml-auto rounded-full border border-dark-600/80 bg-dark-800/80 px-2 py-0.5 text-xs text-dark-300">
            {skills.length}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            id="new-skill-input"
            className="input-field flex-1 text-sm"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill(newSkill);
              }
            }}
            placeholder="Add a new skill..."
          />
          <button
            id="add-skill-btn"
            onClick={() => handleAddSkill(newSkill)}
            className="btn-secondary flex h-10 w-10 items-center justify-center p-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[430px] space-y-2 overflow-y-auto p-5">
        {skills.length === 0 ? (
          <p className="rounded-2xl border border-dark-700/70 bg-dark-900/60 py-5 text-center text-sm text-dark-400">
            No skills yet. Add your first skill above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all
                  ${isMatched(skill)
                    ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
                    : 'border-dark-600/80 bg-dark-800/80 text-dark-200'
                  }`}
              >
                {isMatched(skill) && <Check className="h-3 w-3" />}
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-0.5 text-dark-500 transition-colors hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {filteredMissingSkills.length > 0 && (
          <div className="mt-4 border-t border-dark-700/60 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-orange-200" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-amber-300">
                Missing Skills
              </span>
              <span className="ml-auto rounded-full border border-dark-600/80 bg-dark-800/80 px-2 py-0.5 text-xs text-dark-300">
                {filteredMissingSkills.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {filteredMissingSkills.map((skill) => (
                <MissingSkillButton
                  key={skill}
                  skill={skill}
                  onAdd={handleAddSkill}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MissingSkillButton({ skill, onAdd }) {
  const [state, setState] = useState('idle');

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('loading');
    const success = await onAdd(skill);
    if (success) {
      setState('done');
    } else {
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2.5 text-sm font-medium text-emerald-100 transition-all">
        <Check className="h-4 w-4 flex-shrink-0" />
        <span>{skill}</span>
        <span className="ml-auto text-xs opacity-60">Added</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`group flex w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all
        ${state === 'loading'
          ? 'cursor-wait border-dark-600 bg-dark-800/70 text-dark-400'
          : 'cursor-pointer border-orange-200/35 bg-orange-200/10 text-orange-100 hover:border-orange-100/60 hover:bg-orange-200/20'
        }`}
    >
      {state === 'loading' ? (
        <>
          <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-dark-500 border-t-cyan-300" />
          <span>Adding {skill}...</span>
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 flex-shrink-0 text-orange-100 transition-colors group-hover:text-orange-50" />
          <span>{skill}</span>
          <span className="ml-auto text-xs text-orange-100/80 opacity-0 transition-opacity group-hover:opacity-100">
            Add to resume
          </span>
        </>
      )}
    </button>
  );
}
