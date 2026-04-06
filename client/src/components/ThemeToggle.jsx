import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'roleready_theme';

function getThemeFromDocument() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') {
    return attr;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getThemeFromDocument);
  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="btn-secondary inline-flex items-center gap-2 px-3 py-2"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}
