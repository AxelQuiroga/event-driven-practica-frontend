import type { Turno, TurnoEstado } from '../../services/turnoService';

interface TurnoCardProps {
  turno: Turno;
  onDelete: (id: number) => void;
  onEstadoChange: (id: number, estado: TurnoEstado) => void;
}

const ESTADO_CONFIG: Record<TurnoEstado, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

export function TurnoCard({ turno, onDelete, onEstadoChange }: TurnoCardProps) {
  const estado = ESTADO_CONFIG[turno.estado];

  return (
    <li className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fade-in group">
      <div className="flex-1 min-w-0">
        {/* Cliente y estado */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {turno.cliente_nombre}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado.color}`}>
            {estado.label}
          </span>
        </div>

        {/* Detalles */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
            {turno.servicio_nombre}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(turno.fecha)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {turno.hora.slice(0, 5)} hs
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ${turno.servicio_precio.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Notas */}
        {turno.notas && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
            "{turno.notas}"
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {turno.estado === 'pending' && (
          <>
            <button
              onClick={() => onEstadoChange(turno.id, 'completed')}
              className="px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Marcar como completado"
            >
              ✓ Listo
            </button>
            <button
              onClick={() => onEstadoChange(turno.id, 'cancelled')}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancelar turno"
            >
              ✕ Cancelar
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(turno.id)}
          className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 opacity-70 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={`Eliminar turno de ${turno.cliente_nombre}`}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}

function formatDate(dateStr: string): string {
  const date = dateStr.includes('T')
    ? new Date(dateStr)
    : new Date(dateStr + 'T00:00:00');

  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
