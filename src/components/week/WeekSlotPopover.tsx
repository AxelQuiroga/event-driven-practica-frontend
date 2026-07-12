import { useState, useEffect, useRef } from 'react';
import { api, type Turno, type TurnoEstado, type SlotCapacidad, type Cliente, type Servicio } from '../../services/turnoService';
import { showToast } from '../ui/Toast';

interface WeekSlotPopoverProps {
  fecha: string;
  hora: string;
  turnos: Turno[];
  slot: SlotCapacidad;
  onClose: () => void;
  onRefresh: () => void;
}

const ESTADO_CONFIG: Record<TurnoEstado, { label: string; className: string }> = {
  pending: { label: 'PENDIENTE', className: 'text-amber-500' },
  completed: { label: 'LISTO', className: 'text-emerald-500' },
  cancelled: { label: 'CANCELADO', className: 'text-red-400' },
};

/**
 * Popover inline que muestra los turnos de un slot horario
 * y permite agendar nuevo turno o gestionar los existentes.
 */
export function WeekSlotPopover({ fecha, hora, turnos, slot, onClose, onRefresh }: WeekSlotPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [notas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cerrar con Escape o click afuera
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Cargar servicios al abrir form
  useEffect(() => {
    if (showForm) {
      api.getServicios().then(setServicios).catch(console.error);
    }
  }, [showForm]);

  // Buscar clientes con debounce
  useEffect(() => {
    if (clienteSearch.trim().length < 2) {
      setClientes([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await api.getClientes(clienteSearch);
        setClientes(results);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clienteSearch]);

  // ─── Acciones sobre turnos existentes ────────────────────

  const handleEstadoChange = async (turno: Turno, nuevoEstado: TurnoEstado) => {
    try {
      await api.updateTurnoEstado(turno.id, nuevoEstado);
      const label = nuevoEstado === 'completed' ? 'completado' : 'cancelado';
      showToast('success', `Turno de ${turno.cliente_nombre} ${label}`);
      onRefresh();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (turno: Turno) => {
    try {
      await api.deleteTurno(turno.id);
      showToast('success', `Turno de ${turno.cliente_nombre} eliminado`);
      onRefresh();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Error al eliminar turno');
    }
  };

  // ─── Crear turno ─────────────────────────────────────────

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!selectedCliente && !showNewCliente) newErrors.cliente = 'Seleccioná o creá un cliente';
    if (showNewCliente && !newNombre.trim()) newErrors.cliente = 'Nombre obligatorio';
    if (!servicioId) newErrors.servicio = 'Elegí un servicio';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      let clienteId = selectedCliente?.id;
      if (showNewCliente && !selectedCliente) {
        const nuevo = await api.createCliente({ nombre: newNombre.trim(), telefono: newTelefono || undefined });
        clienteId = nuevo.id;
      }
      if (!clienteId || !servicioId) return;

      await api.createTurno({ cliente_id: clienteId, servicio_id: servicioId, fecha, hora, notas: notas || undefined });
      showToast('success', 'Turno agendado');
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Error al crear turno' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Formatear fecha para mostrar ────────────────────────

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const libre = slot.total - slot.ocupados;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 animate-slide-up max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wide text-gray-900 dark:text-white">
              {formatFecha(fecha)}
            </h3>
            <p className="text-sm text-amber-500 font-bold">
              {hora} hs · {libre > 0 ? `${libre} libre${libre !== 1 ? 's' : ''}` : 'LLENO'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Turnos existentes */}
        {turnos.length > 0 && (
          <div className="space-y-2 mb-4">
            {turnos.map((turno) => {
              const estado = ESTADO_CONFIG[turno.estado];
              return (
                <div key={turno.id} className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-3 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{turno.cliente_nombre}</span>
                      <span className={`ml-2 text-[10px] font-bold uppercase ${estado.className}`}>
                        {estado.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    ✂️ {turno.servicio_nombre} · ${turno.servicio_precio?.toLocaleString('es-AR')}
                  </p>
                  {turno.notas && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 italic mt-1 border-l-2 border-gray-300 dark:border-zinc-600 pl-2">
                      "{turno.notas}"
                    </p>
                  )}

                  {/* Acciones — solo para pending */}
                  {turno.estado === 'pending' && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
                      <button
                        onClick={() => handleEstadoChange(turno, 'completed')}
                        className="flex-1 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-md hover:bg-emerald-400 transition-all"
                      >
                        ✓ LISTO
                      </button>
                      <button
                        onClick={() => handleEstadoChange(turno, 'cancelled')}
                        className="flex-1 py-1.5 bg-gray-300 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 text-[10px] font-black uppercase rounded-md hover:bg-gray-400 dark:hover:bg-zinc-600 transition-all"
                      >
                        ✕ CANCELAR
                      </button>
                      <button
                        onClick={() => handleDelete(turno)}
                        className="w-8 flex items-center justify-center bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all text-xs"
                        aria-label="Eliminar"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Botón Agendar / Formulario */}
        {!showForm ? (
          libre > 0 ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 bg-amber-500 text-black font-black uppercase tracking-wide rounded-lg hover:bg-amber-400 transition-all text-sm"
            >
              + Agendar en este horario
            </button>
          ) : (
            <p className="text-center text-xs text-gray-400 dark:text-zinc-500 font-bold py-2">
              No hay disponibilidad en este horario
            </p>
          )
        ) : (
          <div className="border-t border-gray-200 dark:border-zinc-700 pt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">
              Nuevo turno — {hora} hs
            </h4>

            {/* Cliente */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-1 block">
                Cliente
              </label>
              {selectedCliente ? (
                <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-amber-500/30">
                  <span className="flex-1 text-sm text-gray-900 dark:text-white font-bold">
                    {selectedCliente.nombre}
                    {selectedCliente.telefono && <span className="text-xs font-normal text-gray-500 dark:text-zinc-400 ml-2">{selectedCliente.telefono}</span>}
                  </span>
                  <button onClick={() => { setSelectedCliente(null); setClienteSearch(''); }} className="text-xs text-amber-500">
                    Cambiar
                  </button>
                </div>
              ) : showNewCliente ? (
                <div className="space-y-2 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                  <button onClick={() => { setShowNewCliente(false); setNewNombre(''); setNewTelefono(''); }} className="text-[10px] text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300">
                    ← Volver a buscar
                  </button>
                  <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder="Nombre *"
                    className="w-full px-3 py-1.5 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white text-xs placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500" />
                  <input type="tel" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder="Teléfono (opcional)"
                    className="w-full px-3 py-1.5 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white text-xs placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500" />
                </div>
              ) : (
                <div>
                  <input type="text" value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-xs placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500" />
                  {clientes.length > 0 && (
                    <ul className="mt-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg max-h-24 overflow-y-auto">
                      {clientes.map((c) => (
                        <li key={c.id}>
                          <button onClick={() => { setSelectedCliente(c); setClienteSearch(''); setClientes([]); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs text-gray-900 dark:text-white">
                            {c.nombre}
                            {c.telefono && <span className="text-gray-400 dark:text-zinc-500 ml-2">{c.telefono}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => setShowNewCliente(true)} className="mt-1 text-xs text-amber-500 hover:text-amber-400 font-bold">
                    + Crear cliente nuevo
                  </button>
                </div>
              )}
              {errors.cliente && <p className="mt-1 text-[10px] text-red-400">{errors.cliente}</p>}
            </div>

            {/* Servicio */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-1 block">
                Servicio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setServicioId(s.id)}
                    className={`p-2 rounded-lg text-center transition-all border ${
                      servicioId === s.id
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase">{s.nombre}</span>
                    <span className="block text-[10px] mt-0.5 opacity-75">${s.precio.toLocaleString('es-AR')}</span>
                  </button>
                ))}
              </div>
              {errors.servicio && <p className="mt-1 text-[10px] text-red-400">{errors.servicio}</p>}
            </div>

            {/* Notas */}
            <input type="text" value={notas} onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas (opcional)"
              className="w-full px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-xs placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500" />

            {/* Error general */}
            {errors.submit && <p className="text-[10px] text-red-400 text-center">{errors.submit}</p>}

            {/* Botones */}
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setErrors({}); }}
                className="flex-1 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs font-bold uppercase rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={isSubmitting}
                className="flex-1 py-2 bg-amber-500 text-black text-xs font-black uppercase rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-all">
                {isSubmitting ? 'Agendando...' : 'Agendar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
