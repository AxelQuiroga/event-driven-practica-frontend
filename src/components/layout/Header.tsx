import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="tijeras">
            ✂️
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Peluquería Express
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Gestión de turnos en tiempo real
            </p>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
