import type { CapacidadSlot } from '../../services/turnoService';

interface CapacityViewProps {
  slots: CapacidadSlot[];
  onAgendar: (hora: string) => void;
  loading: boolean;
}

export function CapacityView({ slots, onAgendar, loading }: CapacityViewProps) {
  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 mb-6 border border-gray-200 dark:border-zinc-800">
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 mb-6 border border-gray-200 dark:border-zinc-800">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3">
        Disponibilidad
      </h3>
      <div className="space-y-1">
        {slots.map((slot) => (
          <SlotRow key={slot.hora} slot={slot} onAgendar={onAgendar} />
        ))}
      </div>
    </div>
  );
}

function SlotRow({ slot, onAgendar }: { slot: CapacidadSlot; onAgendar: (hora: string) => void }) {
  const libres = slot.total - slot.ocupados;
  const porcentaje = (slot.ocupados / slot.total) * 100;
  const isFull = slot.ocupados >= slot.total;

  const barColor = isFull
    ? 'bg-red-500'
    : slot.ocupados >= 2
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-3 group">
      {/* Hora */}
      <span className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 w-14 shrink-0">
        {slot.hora}
      </span>

      {/* Barra de capacidad */}
      <div className="flex-1 h-7 bg-gray-200 dark:bg-zinc-800 rounded-md overflow-hidden relative">
        <div
          className={`h-full ${barColor} rounded-md transition-all duration-300`}
          style={{ width: `${porcentaje}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-zinc-300">
          {isFull ? 'LLENO' : `${libres} libre${libres !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Botón agendar */}
      {!isFull && (
        <button
          onClick={() => onAgendar(slot.hora)}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          + Agendar
        </button>
      )}
    </div>
  );
}
