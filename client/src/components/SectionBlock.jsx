import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

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
    <section className="glass-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-dark-700/60 px-4 py-3 sm:px-5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${c.border} ${c.bg}`}>
            <span className={c.icon}>{icon}</span>
          </span>
          <span className="truncate font-semibold text-dark-100">{title}</span>
          <ChevronDown
            className={`ml-auto h-4 w-4 flex-shrink-0 text-dark-500 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dark-600/70 bg-dark-800/80 text-dark-300 transition-colors hover:border-cyan-300/50 hover:bg-cyan-400/10 hover:text-cyan-200"
            aria-label={`Add item to ${title}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-3 p-4 sm:p-5 animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
}
