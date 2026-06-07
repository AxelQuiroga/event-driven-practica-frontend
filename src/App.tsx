import { useState, useEffect, useCallback } from 'react';
import { api, type Turno, type TurnoEstado } from './services/turnoService';
import { useSSE } from './hooks/useSSE';
import { useEventBus } from './hooks/useEventBus';
import { showToast } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { TurnoForm } from './components/turnos/TurnoForm';
import { TurnoList } from './components/turnos/TurnoList';

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
      if (prev.some((t) => t.id === turno.id)) return prev;
      return [turno, ...prev];
    });
    showToast('info', `Nuevo turno: ${turno.cliente_nombre} - ${turno.servicio_nombre}`);
  });

  useEventBus('sse:turnoEliminado', (data: { id: number }) => {
    setTurnos((prev) => prev.filter((t) => t.id !== data.id));
    showToast('info', 'Un turno fue eliminado por otro usuario');
  });

  const fetchTurnos = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const data = await api.getTurnos();
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
    async (data: { cliente_id: number; servicio_id: number; fecha: string; hora: string; notas?: string }) => {
      setError(null);
      setIsCreating(true);
      try {
        const nuevoTurno = await api.createTurno(data);
        setTurnos((prev) => {
          if (prev.some((t) => t.id === nuevoTurno.id)) return prev;
          return [nuevoTurno, ...prev];
        });
        showToast('success', 'Turno creado con éxito');
      } catch (err: any) {
        showToast('error', err.message || 'Error al crear el turno');
        throw err;
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
        await api.deleteTurno(id);
        setTurnos((prev) => prev.filter((t) => t.id !== id));
      } catch (err: any) {
        showToast('error', err.message || 'Error al eliminar el turno');
        throw err;
      }
    },
    [],
  );

  const handleUpdateEstado = useCallback(
    async (id: number, estado: TurnoEstado) => {
      setError(null);
      try {
        const actualizado = await api.updateTurnoEstado(id, estado);
        setTurnos((prev) => prev.map((t) => (t.id === id ? actualizado : t)));
      } catch (err: any) {
        showToast('error', err.message || 'Error al cambiar estado');
        throw err;
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
          updateEstado={handleUpdateEstado}
        />
      </main>
    </div>
  );
};

export default App;
