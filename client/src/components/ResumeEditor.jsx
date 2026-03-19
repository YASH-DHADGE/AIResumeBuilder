import SectionBlock from './SectionBlock';
import {
  User, FileText, Briefcase, GraduationCap,
  Code2, FolderKanban, Award,
} from 'lucide-react';

const PERSONAL_FIELDS = ['name', 'email', 'phone', 'location', 'linkedin', 'github'];

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatLabel(value) {
  if (!value) return '';
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

export default function ResumeEditor({ sections, onUpdateSection }) {
  if (!sections) return null;

  const personalInfo = sections.personalInfo || {};
  const experience = toArray(sections.experience);
  const education = toArray(sections.education);
  const projects = toArray(sections.projects);
  const certifications = toArray(sections.certifications);

  const updateItem = (sectionKey, index, patch) => {
    const list = [...toArray(sections[sectionKey])];
    list[index] = { ...list[index], ...patch };
    onUpdateSection(sectionKey, list);
  };

  const removeItem = (sectionKey, index) => {
    onUpdateSection(
      sectionKey,
      toArray(sections[sectionKey]).filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <SectionBlock
        title="Personal Information"
        icon={<User className="w-5 h-5" />}
        color="primary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAL_FIELDS.map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-dark-400 mb-1 uppercase tracking-wider">
                {formatLabel(field)}
              </label>
              <input
                id={`personal-${field}`}
                className="input-field w-full text-sm"
                value={personalInfo[field] || ''}
                onChange={(e) =>
                  onUpdateSection('personalInfo', {
                    ...personalInfo,
                    [field]: e.target.value,
                  })
                }
                placeholder={formatLabel(field)}
              />
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Professional Summary"
        icon={<FileText className="w-5 h-5" />}
        color="cyan"
      >
        <textarea
          id="summary-textarea"
          className="input-field w-full text-sm resize-none"
          rows={4}
          value={sections.summary || ''}
          onChange={(e) => onUpdateSection('summary', e.target.value)}
          placeholder="Write a compelling professional summary..."
        />
      </SectionBlock>

      <SectionBlock
        title="Experience"
        icon={<Briefcase className="w-5 h-5" />}
        color="violet"
        onAdd={() =>
          onUpdateSection('experience', [
            ...(sections.experience || []),
            { company: '', role: '', duration: '', bullets: [''] },
          ])
        }
      >
        {experience.length === 0 ? (
          <p className="rounded-2xl border border-dark-700/70 bg-dark-900/60 px-4 py-5 text-sm text-dark-400">
            Add experience entries to showcase your professional impact.
          </p>
        ) : (
          experience.map((exp, i) => {
            const bullets = Array.isArray(exp?.bullets) && exp.bullets.length > 0 ? exp.bullets : [''];

            return (
              <div key={`${exp.company || 'experience'}-${i}`} className="space-y-3 rounded-2xl border border-dark-700/70 bg-dark-900/60 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    className="input-field text-sm"
                    value={exp.company || ''}
                    onChange={(e) => updateItem('experience', i, { company: e.target.value })}
                    placeholder="Company"
                  />
                  <input
                    className="input-field text-sm"
                    value={exp.role || ''}
                    onChange={(e) => updateItem('experience', i, { role: e.target.value })}
                    placeholder="Role / Title"
                  />
                  <input
                    className="input-field text-sm"
                    value={exp.duration || ''}
                    onChange={(e) => updateItem('experience', i, { duration: e.target.value })}
                    placeholder="Duration"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-dark-400 uppercase tracking-wider">Bullet Points</label>
                  {bullets.map((bullet, j) => (
                    <div key={`bullet-${i}-${j}`} className="flex gap-2">
                      <span className="mt-2.5 text-sm text-dark-500">•</span>
                      <input
                        className="input-field flex-1 text-sm"
                        value={bullet}
                        onChange={(e) => {
                          const list = [...experience];
                          const nextBullets = [...bullets];
                          nextBullets[j] = e.target.value;
                          list[i] = { ...list[i], bullets: nextBullets };
                          onUpdateSection('experience', list);
                        }}
                        placeholder="Describe an achievement or responsibility..."
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-xs text-cyan-300 transition-colors hover:text-cyan-200"
                    onClick={() => {
                      const list = [...experience];
                      list[i] = { ...list[i], bullets: [...bullets, ''] };
                      onUpdateSection('experience', list);
                    }}
                  >
                    + Add bullet point
                  </button>
                </div>

                <button
                  type="button"
                  className="text-xs text-red-300/80 transition-colors hover:text-red-200"
                  onClick={() => removeItem('experience', i)}
                >
                  Remove this experience
                </button>
              </div>
            );
          })
        )}
      </SectionBlock>

      <SectionBlock
        title="Education"
        icon={<GraduationCap className="w-5 h-5" />}
        color="emerald"
        onAdd={() =>
          onUpdateSection('education', [
            ...(sections.education || []),
            { institution: '', degree: '', year: '', gpa: '' },
          ])
        }
      >
        {education.length === 0 ? (
          <p className="rounded-2xl border border-dark-700/70 bg-dark-900/60 px-4 py-5 text-sm text-dark-400">
            Add education details to strengthen your resume context.
          </p>
        ) : (
          education.map((edu, i) => (
            <div key={`${edu.institution || 'education'}-${i}`} className="rounded-2xl border border-dark-700/70 bg-dark-900/60 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  className="input-field text-sm"
                  value={edu.institution || ''}
                  onChange={(e) => updateItem('education', i, { institution: e.target.value })}
                  placeholder="Institution"
                />
                <input
                  className="input-field text-sm"
                  value={edu.degree || ''}
                  onChange={(e) => updateItem('education', i, { degree: e.target.value })}
                  placeholder="Degree"
                />
                <input
                  className="input-field text-sm"
                  value={edu.year || ''}
                  onChange={(e) => updateItem('education', i, { year: e.target.value })}
                  placeholder="Year"
                />
                <input
                  className="input-field text-sm"
                  value={edu.gpa || ''}
                  onChange={(e) => updateItem('education', i, { gpa: e.target.value })}
                  placeholder="GPA (optional)"
                />
              </div>
              <button
                type="button"
                className="mt-3 text-xs text-red-300/80 transition-colors hover:text-red-200"
                onClick={() => removeItem('education', i)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </SectionBlock>

      <SectionBlock
        title="Projects"
        icon={<FolderKanban className="w-5 h-5" />}
        color="amber"
        onAdd={() =>
          onUpdateSection('projects', [
            ...(sections.projects || []),
            { name: '', description: '', techStack: [], link: '' },
          ])
        }
      >
        {projects.length === 0 ? (
          <p className="rounded-2xl border border-dark-700/70 bg-dark-900/60 px-4 py-5 text-sm text-dark-400">
            Add projects to highlight practical skills and measurable outcomes.
          </p>
        ) : (
          projects.map((proj, i) => (
            <div key={`${proj.name || 'project'}-${i}`} className="space-y-3 rounded-2xl border border-dark-700/70 bg-dark-900/60 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  className="input-field text-sm"
                  value={proj.name || ''}
                  onChange={(e) => updateItem('projects', i, { name: e.target.value })}
                  placeholder="Project Name"
                />
                <input
                  className="input-field text-sm"
                  value={proj.link || ''}
                  onChange={(e) => updateItem('projects', i, { link: e.target.value })}
                  placeholder="Link (optional)"
                />
              </div>
              <textarea
                className="input-field w-full resize-none text-sm"
                rows={3}
                value={proj.description || ''}
                onChange={(e) => updateItem('projects', i, { description: e.target.value })}
                placeholder="Project description..."
              />
              <input
                className="input-field w-full text-sm"
                value={toArray(proj.techStack).join(', ')}
                onChange={(e) =>
                  updateItem('projects', i, {
                    techStack: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Tech stack (comma-separated)"
              />
              <button
                type="button"
                className="text-xs text-red-300/80 transition-colors hover:text-red-200"
                onClick={() => removeItem('projects', i)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </SectionBlock>

      <SectionBlock
        title="Certifications"
        icon={<Award className="w-5 h-5" />}
        color="rose"
        onAdd={() =>
          onUpdateSection('certifications', [...(sections.certifications || []), ''])
        }
      >
        {certifications.length === 0 ? (
          <p className="rounded-2xl border border-dark-700/70 bg-dark-900/60 px-4 py-5 text-sm text-dark-400">
            Add certifications to strengthen credibility for specialized roles.
          </p>
        ) : (
          certifications.map((cert, i) => (
            <div key={`certification-${i}`} className="flex items-center gap-2">
              <input
                className="input-field flex-1 text-sm"
                value={cert || ''}
                onChange={(e) => {
                  const updated = [...certifications];
                  updated[i] = e.target.value;
                  onUpdateSection('certifications', updated);
                }}
                placeholder="Certification name"
              />
              <button
                type="button"
                className="rounded-lg border border-dark-600/80 bg-dark-800/70 px-2 py-1 text-red-300/80 transition-colors hover:border-red-300/40 hover:bg-red-500/10 hover:text-red-200"
                onClick={() => {
                  onUpdateSection(
                    'certifications',
                    certifications.filter((_, idx) => idx !== i)
                  );
                }}
                aria-label="Remove certification"
              >
                ×
              </button>
            </div>
          ))
        )}
      </SectionBlock>
    </div>
  );
}
