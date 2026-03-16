import SectionBlock from './SectionBlock';
import {
  User, FileText, Briefcase, GraduationCap,
  Code2, FolderKanban, Award,
} from 'lucide-react';

export default function ResumeEditor({ sections, onUpdateSection }) {
  if (!sections) return null;

  return (
    <div className="space-y-5">
      {/* Personal Info */}
      <SectionBlock
        title="Personal Information"
        icon={<User className="w-5 h-5" />}
        color="primary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['name', 'email', 'phone', 'location', 'linkedin', 'github'].map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-dark-400 mb-1 uppercase tracking-wider">
                {field}
              </label>
              <input
                id={`personal-${field}`}
                className="input-field w-full text-sm"
                value={sections.personalInfo?.[field] || ''}
                onChange={(e) =>
                  onUpdateSection('personalInfo', {
                    ...sections.personalInfo,
                    [field]: e.target.value,
                  })
                }
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* Summary */}
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

      {/* Experience */}
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
        {(sections.experience || []).map((exp, i) => (
          <div key={i} className="p-4 bg-dark-800/50 rounded-xl space-y-3 border border-dark-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="input-field text-sm"
                value={exp.company}
                onChange={(e) => {
                  const updated = [...sections.experience];
                  updated[i] = { ...updated[i], company: e.target.value };
                  onUpdateSection('experience', updated);
                }}
                placeholder="Company"
              />
              <input
                className="input-field text-sm"
                value={exp.role}
                onChange={(e) => {
                  const updated = [...sections.experience];
                  updated[i] = { ...updated[i], role: e.target.value };
                  onUpdateSection('experience', updated);
                }}
                placeholder="Role / Title"
              />
              <input
                className="input-field text-sm"
                value={exp.duration}
                onChange={(e) => {
                  const updated = [...sections.experience];
                  updated[i] = { ...updated[i], duration: e.target.value };
                  onUpdateSection('experience', updated);
                }}
                placeholder="Duration (e.g., Jan 2022 – Present)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-dark-400 uppercase tracking-wider">Bullet Points</label>
              {(exp.bullets || ['']).map((bullet, j) => (
                <div key={j} className="flex gap-2">
                  <span className="text-dark-500 mt-2.5 text-sm">•</span>
                  <input
                    className="input-field flex-1 text-sm"
                    value={bullet}
                    onChange={(e) => {
                      const updated = [...sections.experience];
                      const bullets = [...updated[i].bullets];
                      bullets[j] = e.target.value;
                      updated[i] = { ...updated[i], bullets };
                      onUpdateSection('experience', updated);
                    }}
                    placeholder="Describe an achievement or responsibility..."
                  />
                </div>
              ))}
              <button
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                onClick={() => {
                  const updated = [...sections.experience];
                  updated[i] = { ...updated[i], bullets: [...(updated[i].bullets || []), ''] };
                  onUpdateSection('experience', updated);
                }}
              >
                + Add bullet point
              </button>
            </div>

            <button
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
              onClick={() => {
                const updated = sections.experience.filter((_, idx) => idx !== i);
                onUpdateSection('experience', updated);
              }}
            >
              Remove this experience
            </button>
          </div>
        ))}
      </SectionBlock>

      {/* Education */}
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
        {(sections.education || []).map((edu, i) => (
          <div key={i} className="p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="input-field text-sm"
                value={edu.institution}
                onChange={(e) => {
                  const updated = [...sections.education];
                  updated[i] = { ...updated[i], institution: e.target.value };
                  onUpdateSection('education', updated);
                }}
                placeholder="Institution"
              />
              <input
                className="input-field text-sm"
                value={edu.degree}
                onChange={(e) => {
                  const updated = [...sections.education];
                  updated[i] = { ...updated[i], degree: e.target.value };
                  onUpdateSection('education', updated);
                }}
                placeholder="Degree"
              />
              <input
                className="input-field text-sm"
                value={edu.year}
                onChange={(e) => {
                  const updated = [...sections.education];
                  updated[i] = { ...updated[i], year: e.target.value };
                  onUpdateSection('education', updated);
                }}
                placeholder="Year (e.g., 2024)"
              />
              <input
                className="input-field text-sm"
                value={edu.gpa}
                onChange={(e) => {
                  const updated = [...sections.education];
                  updated[i] = { ...updated[i], gpa: e.target.value };
                  onUpdateSection('education', updated);
                }}
                placeholder="GPA (optional)"
              />
            </div>
            <button
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors mt-3"
              onClick={() => {
                const updated = sections.education.filter((_, idx) => idx !== i);
                onUpdateSection('education', updated);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </SectionBlock>

      {/* Projects */}
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
        {(sections.projects || []).map((proj, i) => (
          <div key={i} className="p-4 bg-dark-800/50 rounded-xl space-y-3 border border-dark-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="input-field text-sm"
                value={proj.name}
                onChange={(e) => {
                  const updated = [...sections.projects];
                  updated[i] = { ...updated[i], name: e.target.value };
                  onUpdateSection('projects', updated);
                }}
                placeholder="Project Name"
              />
              <input
                className="input-field text-sm"
                value={proj.link}
                onChange={(e) => {
                  const updated = [...sections.projects];
                  updated[i] = { ...updated[i], link: e.target.value };
                  onUpdateSection('projects', updated);
                }}
                placeholder="Link (optional)"
              />
            </div>
            <textarea
              className="input-field w-full text-sm resize-none"
              rows={2}
              value={proj.description}
              onChange={(e) => {
                const updated = [...sections.projects];
                updated[i] = { ...updated[i], description: e.target.value };
                onUpdateSection('projects', updated);
              }}
              placeholder="Project description..."
            />
            <input
              className="input-field w-full text-sm"
              value={(proj.techStack || []).join(', ')}
              onChange={(e) => {
                const updated = [...sections.projects];
                updated[i] = {
                  ...updated[i],
                  techStack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                };
                onUpdateSection('projects', updated);
              }}
              placeholder="Tech stack (comma-separated)"
            />
            <button
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
              onClick={() => {
                const updated = sections.projects.filter((_, idx) => idx !== i);
                onUpdateSection('projects', updated);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </SectionBlock>

      {/* Certifications */}
      <SectionBlock
        title="Certifications"
        icon={<Award className="w-5 h-5" />}
        color="rose"
        onAdd={() =>
          onUpdateSection('certifications', [...(sections.certifications || []), ''])
        }
      >
        {(sections.certifications || []).map((cert, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="input-field flex-1 text-sm"
              value={cert}
              onChange={(e) => {
                const updated = [...sections.certifications];
                updated[i] = e.target.value;
                onUpdateSection('certifications', updated);
              }}
              placeholder="Certification name"
            />
            <button
              className="text-red-400/50 hover:text-red-400 transition-colors p-1"
              onClick={() => {
                const updated = sections.certifications.filter((_, idx) => idx !== i);
                onUpdateSection('certifications', updated);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </SectionBlock>
    </div>
  );
}
