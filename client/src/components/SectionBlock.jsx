import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

const COLOR_MAP = {
  primary: {
    icon: 'text-primary-400',
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/20',
  },
  cyan: {
    icon: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  violet: {
    icon: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  emerald: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  rose: {
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
};

export default function SectionBlock({ title, icon, color = 'primary', children, onAdd }) {
  const [open, setOpen] = useState(true);
  const c = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-dark-700/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${c.bg} border ${c.border} rounded-lg flex items-center justify-center`}>
            <span className={c.icon}>{icon}</span>
          </div>
          <h3 className="font-semibold text-dark-100">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {open ? (
            <ChevronUp className="w-5 h-5 text-dark-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-dark-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
