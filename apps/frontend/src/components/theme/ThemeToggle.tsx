'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className="inline-flex h-9 items-center gap-2 rounded-full border bg-card px-1.5 pr-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
      onClick={toggleTheme}
      disabled={!mounted}
    >
      <span
        className={cn(
          'relative flex h-6 w-11 items-center rounded-full border transition-colors',
          isDark ? 'bg-primary/30' : 'bg-sky-100',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-primary shadow transition-transform',
            isDark && 'translate-x-5',
          )}
        >
          {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </span>
      </span>
      <span className="hidden sm:inline">{isDark ? 'Тёмная' : 'Светлая'}</span>
    </button>
  );
}
