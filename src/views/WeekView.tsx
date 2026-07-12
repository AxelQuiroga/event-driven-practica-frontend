import { useState, useEffect, useCallback } from 'react';
import { api, type CapacidadSemanaResponse } from '../services/turnoService';
import { useSSE } from '../hooks/useSSE';
import { useEventBus } from '../hooks/useEventBus';
import { showToast } from '../components/ui/Toast';
import { WeekNavigation } from '../components/week/WeekNavigation';
import { WeeklyGrid } from '../components/week/WeeklyGrid';

/**
 * Calcula el lunes de la semana para una fecha dada (YYYY-MM-DD).
 * Usa UTC para evitar bugs de timezone con toISOString().
 */
function getLunesDeLaSemana(fecha: Date): string {
  // Usar getUTC* para no perder un día en UTC-3
  const year = fecha.getUTCFullYear();
  const month = fecha.getUTCMonth();
  const day = fecha.getUTCDate();
  const dow = fecha.getUTCDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  const diff = dow === 0 ? 6 : dow - 1;
  const d = new Date(Date.UTC(year, month, day - diff));
  return d.toISOString().split('T')[0];
}

/**
 * Suma N días a una fecha YYYY-MM-DD sin usar Date local.
 * Evita el bug de timezone con toISOString().
 */
function addDays(fechaStr: string, days: number): string {
  const [year, month, day] = fechaStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().split('T')[0];
}

/**
 * Vista semanal — orquestador.
 * Maneja navegación entre semanas, fetch de datos, y SSE.
 */
export function WeekView() {
  const [semanaDesde, setSemanaDesde] = useState(() => getLunesDeLaSemana(new Date()));
  const [data, setData] = useState<CapacidadSemanaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SSE
  useSSE();

  // Cuando llega un turno nuevo por SSE, refrescar la semana si aplica
  useEventBus('sse:turnoCreado', (turno: any) => {
    if (turno.fecha >= semanaDesde && turno.fecha <= addDays(semanaDesde, 6)) {
      fetchSemana(semanaDesde);
    }
    showToast('info', `${turno.cliente_nombre} - ${turno.servicio_nombre}`);
  });

  useEventBus('sse:turnoEliminado', () => {
    // Refrescar siempre — no sabemos a qué semana pertenece el ID
    fetchSemana(semanaDesde);
  });

  const fetchSemana = useCallback(async (desde: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getCapacidadSemana(desde);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la semana');
      showToast('error', 'Error al cargar la semana');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar cuando cambia la semana
  useEffect(() => {
    fetchSemana(semanaDesde);
  }, [semanaDesde, fetchSemana]);

  // Navegación
  const handleAnterior = useCallback(() => {
    setSemanaDesde((prev) => addDays(prev, -7));
  }, []);

  const handleSiguiente = useCallback(() => {
    setSemanaDesde((prev) => addDays(prev, 7));
  }, []);

  const handleHoy = useCallback(() => {
    setSemanaDesde(getLunesDeLaSemana(new Date()));
  }, []);

  return (
    <>
      <WeekNavigation
        desde={semanaDesde}
        hasta={addDays(semanaDesde, 6)}
        onAnterior={handleAnterior}
        onSiguiente={handleSiguiente}
        onHoy={handleHoy}
      />

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm font-bold mb-3">{error}</p>
          <button
            onClick={() => fetchSemana(semanaDesde)}
            className="px-4 py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded-lg hover:bg-amber-400 transition-all"
          >
            Reintentar
          </button>
        </div>
      ) : !data && isLoading ? (
        /* Skeleton de grilla */
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-900 rounded-lg animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : data ? (
        <WeeklyGrid data={data} onRefresh={() => fetchSemana(semanaDesde)} />
      ) : null}
    </>
  );
}
