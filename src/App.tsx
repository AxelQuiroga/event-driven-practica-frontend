import { useState, useEffect, useCallback } from 'react';
import { api, type Turno, type TurnoEstado, type CapacidadSlot } from './services/turnoService';
import { useSSE } from './hooks/useSSE';
import { useEventBus } from './hooks/useEventBus';
import { showToast } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { DaySelector } from './components/turnos/DaySelector';
import { CapacityView } from './components/turnos/CapacityView';
import { QuickTurnoForm } from './components/turnos/QuickTurnoForm';
import { TurnoCard } from './components/turnos/TurnoCard';
import { EmptyState } from './components/ui/EmptyState';
import { ErrorState } from './components/ui/ErrorState';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [capacidad, setCapacidad] = useState<CapacidadSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick form state
  const [quickFormOpen, setQuickFormOpen] = useState(false);
  const [quickFormHora, setQuickFormHora] = useState('');

  // SSE
  useSSE();

  useEventBus('sse:turnoCreado', (turno: Turno) => {
    if (turno.fecha === selectedDate) {
      setTurnos((prev) => {
        if (prev.some((t) => t.id === turno.id)) return prev;
        return [...prev, turno];
      });
      fetchCapacidad(selectedDate);
    }
    showToast('info', `${turno.cliente_nombre} - ${turno.servicio_nombre}`);
  });

  useEventBus('sse:turnoEliminado', (data: { id: number }) => {
    setTurnos((prev) => prev.filter((t) => t.id !== data.id));
    fetchCapacidad(selectedDate);
  });

  // Fetch turnos del día
  const fetchTurnos = useCallback(async (fecha: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTurnos(fecha);
      setTurnos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar turnos');
      showToast('error', 'Error al cargar turnos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch capacidad del día — retorna los datos para poder await desde afuera
  const fetchCapacidad = useCallback(async (fecha: string) => {
    try {
      const data = await api.getCapacidad(fecha);
      setCapacidad(data);
      return data;
    } catch (err) {
      console.error('[Capacidad] Error al obtener disponibilidad:', err);
      // No relanzamos: que falle la capacidad no debe romper el flujo principal
      return null;
    }
  }, []);

  // Cargar cuando cambia la fecha
  useEffect(() => {
    fetchTurnos(selectedDate);
    fetchCapacidad(selectedDate);
  }, [selectedDate, fetchTurnos, fetchCapacidad]);

  // Abrir quick form
  const handleAgendar = useCallback((hora: string) => {
    setQuickFormHora(hora);
    setQuickFormOpen(true);
  }, []);

  // Crear turno desde quick form — con await en capacidad
  const handleQuickSubmit = useCallback(
    async (data: { cliente_id: number; servicio_id: number; fecha: string; hora: string; notas?: string }) => {
      const nuevoTurno = await api.createTurno(data);
      setTurnos((prev) => [...prev, nuevoTurno]);
      // Esperamos a que la capacidad se refresque ANTES de mostrar el toast
      await fetchCapacidad(selectedDate);
      showToast('success', `Turno agendado — ${nuevoTurno.cliente_nombre}`);
    },
    [selectedDate, fetchCapacidad],
  );

  // Cambiar estado
  const handleEstadoChange = useCallback(
    async (id: number, estado: TurnoEstado) => {
      const actualizado = await api.updateTurnoEstado(id, estado);
      setTurnos((prev) => prev.map((t) => (t.id === id ? actualizado : t)));
      await fetchCapacidad(selectedDate);
      const label = estado === 'completed' ? 'completado' : 'cancelado';
      showToast('success', `Turno ${label}`);
    },
    [selectedDate, fetchCapacidad],
  );

  // Eliminar
  const handleDelete = useCallback(
    async (id: number) => {
      await api.deleteTurno(id);
      setTurnos((prev) => prev.filter((t) => t.id !== id));
      await fetchCapacidad(selectedDate);
      showToast('success', 'Turno eliminado');
    },
    [selectedDate, fetchCapacidad],
  );

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Selector de día */}
        <div className="mb-6">
          <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {/* Capacidad */}
        <CapacityView
          slots={capacidad}
          onAgendar={handleAgendar}
          loading={isLoading && capacidad.length === 0}
        />

        {/* Turnos del día */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Turnos del día ({turnos.length})
          </h3>

          {error ? (
            <ErrorState message={error} onRetry={() => fetchTurnos(selectedDate)} />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : turnos.length === 0 ? (
            <EmptyState
              title="Sin turnos"
              message="No hay turnos para este día"
              icon="📅"
            />
          ) : (
            turnos
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((turno) => (
                <TurnoCard
                  key={turno.id}
                  turno={turno}
                  onDelete={handleDelete}
                  onEstadoChange={handleEstadoChange}
                />
              ))
          )}
        </div>
      </main>

      {/* Quick form modal */}
      <QuickTurnoForm
        hora={quickFormHora}
        fecha={selectedDate}
        isOpen={quickFormOpen}
        onClose={() => setQuickFormOpen(false)}
        onSubmit={handleQuickSubmit}
      />
    </div>
  );
};

export default App;
