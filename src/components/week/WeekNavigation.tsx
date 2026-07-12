interface WeekNavigationProps {
  desde: string;
  hasta: string;
  onAnterior: () => void;
  onSiguiente: () => void;
  onHoy: () => void;
}

/**
 * Formatea fechas para mostrar: "7 - 13 Jul 2026"
 */
function formatRange(desde: string, hasta: string): string {
  const d = new Date(desde + 'T00:00:00');
  const h = new Date(hasta + 'T00:00:00');

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Si están en el mismo mes: "7 - 13 Jul 2026"
  if (d.getMonth() === h.getMonth()) {
    return `${d.getDate()} - ${h.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Si están en meses distintos: "30 Jun - 6 Jul 2026"
  return `${d.getDate()} ${meses[d.getMonth()]} - ${h.getDate()} ${meses[h.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Indica si la semana mostrada incluye la fecha de hoy.
 */
function semanaContieneHoy(desde: string, hasta: string): boolean {
  const hoy = new Date().toISOString().split('T')[0];
  return hoy >= desde && hoy <= hasta;
}

export function WeekNavigation({ desde, hasta, onAnterior, onSiguiente, onHoy }: WeekNavigationProps) {
  const esEstaSemana = semanaContieneHoy(desde, hasta);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Flecha izquierda */}
      <button
        onClick={onAnterior}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
        aria-label="Semana anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Centro: rango de fechas + botón Hoy */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300">
          {formatRange(desde, hasta)}
        </h2>
        {!esEstaSemana && (
          <button
            onClick={onHoy}
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-all"
          >
            Hoy
          </button>
        )}
      </div>

      {/* Flecha derecha */}
      <button
        onClick={onSiguiente}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
        aria-label="Semana siguiente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
