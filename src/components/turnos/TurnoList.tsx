import { useState, useMemo, useCallback } from 'react';
import { eventBus } from '../../lib/eventBus';
import { showToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { TurnoSkeleton } from '../ui/Skeleton';
import { TurnoCard } from './TurnoCard';
import { TurnoFilters, type SortField, type SortDirection } from './TurnoFilters';
import type { Turno } from '../../services/turnoService';

interface TurnoListProps {
  turnos: Turno[];
  loading: boolean;
  error: string | null;
  fetchTurnos: () => Promise<void>;
  deleteTurno: (id: number) => Promise<void>;
}

export function TurnoList({ turnos, loading, error, fetchTurnos, deleteTurno }: TurnoListProps) {
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros y ordenamiento
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSorted = useMemo(() => {
    let result = [...turnos];

    // Filtro por búsqueda (nombre)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.nombre.toLowerCase().includes(q));
    }

    // Filtro por servicio
    if (serviceFilter) {
      result = result.filter((t) => t.servicio === serviceFilter);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'fecha':
          cmp = `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`);
          break;
        case 'nombre':
          cmp = a.nombre.localeCompare(b.nombre);
          break;
        case 'servicio':
          cmp = a.servicio.localeCompare(b.servicio);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [turnos, search, serviceFilter, sortField, sortDirection]);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteTarget(id);
  }, []);

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    setIsDeleting(true);
    try {
      await deleteTurno(deleteTarget);
      showToast('success', 'Turno eliminado correctamente');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('error', err.message || 'Error al eliminar el turno');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchTurnos} />;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Turnos {!loading && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({filteredAndSorted.length})</span>}
          </h2>

          {turnos.length > 0 && (
            <TurnoFilters
              search={search}
              onSearchChange={setSearch}
              serviceFilter={serviceFilter}
              onServiceFilterChange={setServiceFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={(field) => {
                if (sortField === field) {
                  setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortField(field);
                  setSortDirection('asc');
                }
              }}
              servicios={[...new Set(turnos.map((t) => t.servicio))]}
            />
          )}
        </div>

        {loading ? (
          <div className="p-4">
            <TurnoSkeleton />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          turnos.length === 0 ? (
            <EmptyState />
          ) : (
            <EmptyState
              title="Sin resultados"
              message={`No se encontraron turnos${search ? ` para "${search}"` : ''}${serviceFilter ? ` con servicio "${serviceFilter}"` : ''}.`
              }
              icon="🔍"
            />
          )
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSorted.map((turno) => (
              <TurnoCard
                key={turno.id}
                turno={turno}
                onDelete={handleDeleteClick}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar turno"
        message="¿Estás seguro de que querés eliminar este turno? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
