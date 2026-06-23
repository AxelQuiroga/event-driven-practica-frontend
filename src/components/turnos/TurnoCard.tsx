import type { Turno, TurnoEstado } from '../../services/turnoService';

interface TurnoCardProps {
  turno: Turno;
  onDelete: (id: number) => void;
  onEstadoChange: (id: number, estado: TurnoEstado) => void;
}

const ESTADO_CONFIG: Record<TurnoEstado, { label: string; className: string }> = {
  pending: {
    label: 'PENDIENTE',
    className: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
  },
  completed: {
    label: 'LISTO',
    className: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30',
  },
  cancelled: {
    label: 'CANCELADO',
    className: 'bg-red-500/20 text-red-500 border border-red-500/30',
  },
};

export function TurnoCard({ turno, onDelete, onEstadoChange }: TurnoCardProps) {
  const estado = ESTADO_CONFIG[turno.estado];

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-3 transition-all hover:border-zinc-700">
      {/* Fila principal: nombre + hora */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black uppercase tracking-wide text-white truncate">
            {turno.cliente_nombre}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${estado.className}`}>
              {estado.label}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className="text-xl font-black text-amber-500 font-mono">
            {turno.hora.slice(0, 5)}
          </span>
        </div>
      </div>

      {/* Servicio + precio */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-400">
          ✂️ {turno.servicio_nombre}
        </span>
        <span className="text-sm font-bold text-zinc-300">
          ${turno.servicio_precio.toLocaleString('es-AR')}
        </span>
      </div>

      {/* Notas */}
      {turno.notas && (
        <p className="text-xs text-zinc-500 italic mb-3 border-l-2 border-zinc-700 pl-2">
          "{turno.notas}"
        </p>
      )}

      {/* Acciones — solo si está pendiente */}
      {turno.estado === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-zinc-800">
          <button
            onClick={() => onEstadoChange(turno.id, 'completed')}
            className="flex-1 py-2.5 bg-emerald-500 text-black text-sm font-black uppercase tracking-wide rounded-lg hover:bg-emerald-400 transition-all"
          >
            ✓ LISTO
          </button>
          <button
            onClick={() => onEstadoChange(turno.id, 'cancelled')}
            className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 text-sm font-black uppercase tracking-wide rounded-lg hover:bg-zinc-600 transition-all"
          >
            ✕ CANCELAR
          </button>
          <button
            onClick={() => onDelete(turno.id)}
            className="w-10 flex items-center justify-center bg-zinc-800 text-zinc-500 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
            aria-label="Eliminar"
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );
}
