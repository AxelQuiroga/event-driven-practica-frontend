import type { Turno } from '../../services/turnoService';

interface TurnoCardProps {
  turno: Turno;
  onDelete: (id: number) => void;
}

export function TurnoCard({ turno, onDelete }: TurnoCardProps) {
  return (
    <li className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fade-in group">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {turno.nombre}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
            {turno.servicio}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(turno.fecha)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {turno.hora.slice(0, 5)} hs
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(turno.id)}
        className="self-end sm:self-auto px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 opacity-70 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label={`Eliminar turno de ${turno.nombre}`}
      >
        Eliminar
      </button>
    </li>
  );
}

function formatDate(dateStr: string): string {
  // PostgreSQL devuelve DATE como ISO string: "2026-05-31T00:00:00.000Z"
  // El frontend envía solo la fecha: "2026-05-31"
  // Detectamos cuál es y parseamos en consecuencia
  const date = dateStr.includes('T')
    ? new Date(dateStr)
    : new Date(dateStr + 'T00:00:00');

  if (isNaN(date.getTime())) {
    return dateStr; // fallback: mostrar el string original
  }

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
