import { useState, useEffect, useCallback } from 'react';
import { eventBus } from './lib/eventBus';
import { turnoService } from './services/turnoService';
import { useSSE } from './hooks/useSSE';
import { useEventBus } from './hooks/useEventBus';
import { showToast } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { TurnoForm } from './components/turnos/TurnoForm';
import { TurnoList } from './components/turnos/TurnoList';
import type { Turno } from './services/turnoService';

const App: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conectar al SSE del backend para recibir eventos en tiempo real
  useSSE();

  // Escuchar eventos SSE re-publicados en el eventBus local
  useEventBus('sse:turnoCreado', (turno: Turno) => {
    setTurnos((prev) => {
      // Evitar duplicados por si el mismo usuario creó el turno
      if (prev.some((t) => t.id === turno.id)) return prev;
      return [turno, ...prev];
    });
    showToast('info', `Nuevo turno: ${turno.nombre} - ${turno.servicio}`);
  });

  useEventBus('sse:turnoEliminado', (data: { id: number }) => {
    setTurnos((prev) => prev.filter((t) => t.id !== data.id));
    showToast('info', 'Un turno fue eliminado por otro usuario');
  });

  const fetchTurnos = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const data = await turnoService.getAll();
      setTurnos(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la lista de turnos');
      showToast('error', 'Error al cargar los turnos');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const handleCreateTurno = useCallback(
    async (data: { nombre: string; servicio: string; fecha: string; hora: string }) => {
      setError(null);
      setIsCreating(true);
      try {
        const nuevoTurno = await turnoService.create(data);
        // Agregar optimistamente a la lista con check de duplicado
        // (el SSE puede haberlo agregado primero porque viaja más rápido)
        setTurnos((prev) => {
          if (prev.some((t) => t.id === nuevoTurno.id)) return prev;
          return [nuevoTurno, ...prev];
        });
        showToast('success', `Turno de ${data.nombre} creado con éxito`);
        // Publicar en eventBus local para que otros componentes reaccionen
        eventBus.publish('turnoCreado', nuevoTurno);
      } catch (err: any) {
        showToast('error', err.message || 'Error al crear el turno');
        throw err; // Para que el form sepa que falló
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const handleDeleteTurno = useCallback(
    async (id: number) => {
      setError(null);
      try {
        await turnoService.delete(id);
        // Remover optimistamente de la lista
        setTurnos((prev) => prev.filter((t) => t.id !== id));
        // Publicar en eventBus local
        eventBus.publish('turnoEliminado', { id });
      } catch (err: any) {
        showToast('error', err.message || 'Error al eliminar el turno');
        throw err; // Para que el modal sepa que falló
      }
    },
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <TurnoForm onSubmit={handleCreateTurno} isLoading={isCreating} />

        <TurnoList
          turnos={turnos}
          loading={isLoadingList}
          error={error}
          fetchTurnos={fetchTurnos}
          deleteTurno={handleDeleteTurno}
        />
      </main>
    </div>
  );
};

export default App;
