import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
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

        <ThemeToggle />
      </div>
    </header>
  );
}
