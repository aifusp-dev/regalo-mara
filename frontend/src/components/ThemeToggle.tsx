import { useDarkMode } from '../hooks/useDarkMode';

export function ThemeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-xl shadow-md backdrop-blur-sm transition hover:scale-110 dark:border-white/15 dark:bg-white/10"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
