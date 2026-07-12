import { useState } from 'react';
import type { CapacidadSemanaResponse, DiaCapacidad, SlotCapacidad, Turno } from '../../services/turnoService';
import { WeekSlotPopover } from './WeekSlotPopover';

interface WeeklyGridProps {
  data: CapacidadSemanaResponse;
  onRefresh: () => void;
}

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * Índice del día de la semana (0=Lun ... 6=Dom) a partir de un string ISO.
 */
function dayIndex(fecha: string): number {
  const d = new Date(fecha + 'T00:00:00');
  const day = d.getDay(); // 0=Dom
  return day === 0 ? 6 : day - 1; // Convertir a 0=Lun
}

/**
 * Color de la barra de capacidad según ocupación.
 */
function slotColor(ocupados: number, total: number): string {
  if (ocupados >= total) return 'bg-red-500';
  if (ocupados >= 2) return 'bg-amber-500';
  if (ocupados >= 1) return 'bg-emerald-500';
  return 'bg-zinc-800 dark:bg-zinc-700';
}

/**
 * Indica si una fecha es hoy (usando hora local, no UTC).
 */
function esHoy(fecha: string): boolean {
  const d = new Date();
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return fecha === hoy;
}

export function WeeklyGrid({ data, onRefresh }: WeeklyGridProps) {
  const [popover, setPopover] = useState<{
    fecha: string;
    hora: string;
    turnos: Turno[];
    slot: SlotCapacidad;
  } | null>(null);

  const handleCellClick = (fecha: string, slot: SlotCapacidad) => {
    const dia = data.dias.find((d) => d.fecha === fecha);
    const turnosEnSlot = dia?.turnos.filter((t) => t.hora === slot.hora) ?? [];

    setPopover({
      fecha,
      hora: slot.hora,
      turnos: turnosEnSlot,
      slot,
    });
  };

  const closePopover = () => setPopover(null);

  // ─── DESKTOP: Grilla 7 columnas ──────────────────────────
  const renderDesktopGrid = () => {
    // Filas = slots (09:00 a 19:00)
    const primerDia = data.dias[0];
    if (!primerDia) return null;

    return (
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header: días */}
          <thead>
            <tr>
              <th className="w-16 py-2 px-1" /> {/* columna de horas */}
              {data.dias.map((dia, i) => {
                const hoy = esHoy(dia.fecha);
                return (
                  <th key={dia.fecha} className="py-2 px-1 text-center">
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${hoy ? 'text-amber-500' : 'text-gray-500 dark:text-zinc-500'}`}>
                      {DIAS_CORTOS[i]}
                    </div>
                    <div className={`text-lg font-black ${hoy ? 'text-amber-500' : 'text-gray-700 dark:text-zinc-300'}`}>
                      {new Date(dia.fecha + 'T00:00:00').getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body: slots */}
          <tbody>
            {primerDia.slots.map((slotModel) => (
              <tr key={slotModel.hora}>
                {/* Hora */}
                <td className="py-0.5 px-1 text-right">
                  <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-500">
                    {slotModel.hora}
                  </span>
                </td>

                {/* 7 celdas — una por día */}
                {data.dias.map((dia) => {
                  const slot = dia.slots.find((s) => s.hora === slotModel.hora) ?? slotModel;
                  const libre = slot.total - slot.ocupados;
                  const isFull = slot.ocupados >= slot.total;
                  const isSelected =
                    popover?.fecha === dia.fecha && popover?.hora === slot.hora;

                  return (
                    <td key={`${dia.fecha}-${slot.hora}`} className="py-0.5 px-0.5">
                      <button
                        onClick={() => handleCellClick(dia.fecha, slot)}
                        className={`
                          w-full h-8 rounded-md text-[10px] font-bold
                          transition-all duration-150 border
                          ${isSelected ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-transparent'}
                          ${isFull
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : slot.ocupados > 0
                              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700'
                              : 'bg-gray-100 dark:bg-zinc-900 text-gray-400 dark:text-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-800'
                          }
                        `}
                      >
                        {isFull ? '✕' : slot.ocupados > 0 ? slot.ocupados : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-3 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold">1 libre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold">1 libre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold">Lleno</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── MOBILE: Lista apilada ───────────────────────────────
  const renderMobileList = () => {
    return (
      <div className="md:hidden space-y-3">
        {data.dias.map((dia, i) => {
          const hoy = esHoy(dia.fecha);
          const totalTurnos = dia.turnos.length;

          return (
            <div
              key={dia.fecha}
              className={`bg-gray-100 dark:bg-zinc-900 rounded-xl border ${hoy ? 'border-amber-500/30' : 'border-gray-200 dark:border-zinc-800'} overflow-hidden`}
            >
              {/* Header del día */}
              <div className={`px-4 py-3 flex items-center justify-between ${hoy ? 'bg-amber-500/10' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black uppercase ${hoy ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                    {DIAS_LARGOS[i]}
                  </span>
                  {hoy && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-500 text-black rounded">
                      Hoy
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-500 font-bold">
                  {new Date(dia.fecha + 'T00:00:00').getDate()} · {totalTurnos} turno{totalTurnos !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Slots con turnos (solo mostrar los que tienen algo o están cerca) */}
              <div className="px-4 py-2 space-y-1">
                {dia.slots
                  .filter((s) => s.ocupados > 0)
                  .map((slot) => (
                    <button
                      key={slot.hora}
                      onClick={() => handleCellClick(dia.fecha, slot)}
                      className="w-full flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all text-left"
                    >
                      <span className="text-xs font-mono font-bold text-gray-500 dark:text-zinc-400 w-12">
                        {slot.hora}
                      </span>
                      <div className="flex-1 h-2 bg-gray-300 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${slotColor(slot.ocupados, slot.total)}`}
                          style={{ width: `${(slot.ocupados / slot.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 w-12 text-right">
                        {slot.ocupados}/{slot.total}
                      </span>
                    </button>
                  ))}

                {dia.slots.every((s) => s.ocupados === 0) && (
                  <p className="text-xs text-gray-400 dark:text-zinc-600 py-2 text-center">Sin turnos</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative">
      {renderDesktopGrid()}
      {renderMobileList()}

      {/* Popover inline */}
      {popover && (
        <WeekSlotPopover
          fecha={popover.fecha}
          hora={popover.hora}
          turnos={popover.turnos}
          slot={popover.slot}
          onClose={closePopover}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
