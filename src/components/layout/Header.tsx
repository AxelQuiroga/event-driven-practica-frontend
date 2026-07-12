import type { ViewMode } from '../../App';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Header({ viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo + Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-xl" role="img" aria-label="tijeras">
              ✂️
            </span>
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wide text-white">
              Barber Shop
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Sistema de turnos
            </p>
          </div>
        </div>

        {/* Center: Toggle Día / Semana */}
        <div className="flex items-center bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('dia')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${
              viewMode === 'dia'
                ? 'bg-amber-500 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📅 Día
          </button>
          <button
            onClick={() => onViewModeChange('semana')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${
              viewMode === 'semana'
                ? 'bg-amber-500 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📊 Semana
          </button>
        </div>

        {/* Right: Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
