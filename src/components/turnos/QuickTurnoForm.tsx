import { useState, useEffect, useRef, useCallback } from 'react';
import { api, type Cliente, type Servicio } from '../../services/turnoService';

interface QuickTurnoFormProps {
  hora: string;
  fecha: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    cliente_id: number;
    servicio_id: number;
    fecha: string;
    hora: string;
    notas?: string;
  }) => Promise<void>;
}

export function QuickTurnoForm({ hora, fecha, isOpen, onClose, onSubmit }: QuickTurnoFormProps) {
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

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Cargar servicios
  useEffect(() => {
    if (isOpen) {
      api.getServicios().then(setServicios).catch(console.error);
      // Focus en búsqueda de cliente
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setClienteSearch('');
      setSelectedCliente(null);
      setShowNewCliente(false);
      setNewNombre('');
      setNewTelefono('');
      setServicioId(null);
      setNotas('');
      setErrors({});
    }
  }, [isOpen]);

  // Buscar clientes
  const searchClientes = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setClientes([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.getClientes(query);
        setClientes(results);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  }, []);

  useEffect(() => {
    searchClientes(clienteSearch);
  }, [clienteSearch, searchClientes]);

  const handleSubmit = async () => {
    // Validar
    const newErrors: Record<string, string> = {};
    if (!selectedCliente && !showNewCliente) {
      newErrors.cliente = 'Seleccioná o creá un cliente';
    }
    if (showNewCliente && !newNombre.trim()) {
      newErrors.cliente = 'El nombre es obligatorio';
    }
    if (!servicioId) {
      newErrors.servicio = 'Elegí un servicio';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let clienteId = selectedCliente?.id;

      if (showNewCliente && !selectedCliente) {
        const nuevo = await api.createCliente({
          nombre: newNombre.trim(),
          telefono: newTelefono || undefined,
        });
        clienteId = nuevo.id;
      }

      if (!clienteId || !servicioId) return;

      await onSubmit({
        cliente_id: clienteId,
        servicio_id: servicioId,
        fecha,
        hora,
        notas: notas || undefined,
      });

      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Error al crear turno' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
              Agendar
            </h2>
            <p className="text-sm text-amber-500 font-bold">
              {fecha} a las {hora} hs
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 block">
            Cliente
          </label>

          {selectedCliente ? (
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-amber-500/30">
              <span className="flex-1 text-gray-900 dark:text-white font-bold">
                {selectedCliente.nombre}
                {selectedCliente.telefono && (
                  <span className="text-sm font-normal text-gray-500 dark:text-zinc-400 ml-2">{selectedCliente.telefono}</span>
                )}
              </span>
              <button
                onClick={() => { setSelectedCliente(null); setClienteSearch(''); }}
                className="text-sm text-amber-500 hover:text-amber-400"
              >
                Cambiar
              </button>
            </div>
          ) : showNewCliente ? (
            <div className="space-y-2 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              <button
                onClick={() => { setShowNewCliente(false); setNewNombre(''); setNewTelefono(''); }}
                className="text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
              >
                ← Volver a buscar
              </button>
              <input
                type="text"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="Nombre *"
                className="w-full px-3 py-2 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <input
                type="tel"
                value={newTelefono}
                onChange={(e) => setNewTelefono(e.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full px-3 py-2 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          ) : (
            <div>
              <input
                ref={searchRef}
                type="text"
                value={clienteSearch}
                onChange={(e) => {
                  setClienteSearch(e.target.value);
                  if (errors.cliente) setErrors((prev) => ({ ...prev, cliente: '' }));
                }}
                placeholder="Buscar por nombre o teléfono..."
                className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              {clientes.length > 0 && (
                <ul className="mt-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg max-h-32 overflow-y-auto">
                  {clientes.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setSelectedCliente(c);
                          setClienteSearch('');
                          setClientes([]);
                          if (errors.cliente) setErrors((prev) => ({ ...prev, cliente: '' }));
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-zinc-700 text-sm text-gray-900 dark:text-white"
                      >
                        {c.nombre}
                        {c.telefono && <span className="text-gray-400 dark:text-zinc-500 ml-2">{c.telefono}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setShowNewCliente(true)}
                className="mt-2 text-sm text-amber-500 hover:text-amber-400 font-bold"
              >
                + Crear cliente nuevo
              </button>
            </div>
          )}
          {errors.cliente && <p className="mt-1 text-xs text-red-400">{errors.cliente}</p>}
        </div>

        {/* Servicio — BOTONES */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 block">
            Servicio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServicioId(s.id);
                  if (errors.servicio) setErrors((prev) => ({ ...prev, servicio: '' }));
                }}
                className={`p-3 rounded-lg text-center transition-all border-2 ${
                  servicioId === s.id
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
                }`}
              >
                <span className="block text-xs font-bold uppercase">{s.nombre}</span>
                <span className="block text-xs mt-1 opacity-75">${s.precio.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
          {errors.servicio && <p className="mt-1 text-xs text-red-400">{errors.servicio}</p>}
        </div>

        {/* Notas */}
        <div className="mb-5">
          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas (opcional): quiere con Maxi, pelo rizado..."
            className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Error general */}
        {errors.submit && (
          <p className="mb-3 text-sm text-red-400 text-center">{errors.submit}</p>
        )}

        {/* Botón submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-amber-500 text-black font-black uppercase tracking-wide rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Agendando...
            </span>
          ) : (
            'Agendar Turno'
          )}
        </button>
      </div>
    </div>
  );
}
