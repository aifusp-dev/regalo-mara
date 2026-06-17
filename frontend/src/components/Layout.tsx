import { Outlet } from 'react-router-dom';
import { Decorations } from './Decorations';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  return (
    <>
      <Decorations />
      <ThemeToggle />
      <div className="relative z-10">
        <Outlet />
      </div>
    </>
  );
}
