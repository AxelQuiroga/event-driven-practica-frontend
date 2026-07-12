import { useState, useEffect, useRef, useCallback } from 'react';
import { api, type Cliente, type Servicio } from '../../services/turnoService';

interface TurnoFormProps {
  onSubmit: (data: {
    cliente_id: number;
    servicio_id: number;
    fecha: string;
    hora: string;
    notas?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

// Franjas horarias: cada 30 min de 09:00 a 19:00
const HORAS = Array.from({ length: 21 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export function TurnoForm({ onSubmit, isLoading }: TurnoFormProps) {
  // ─── State ──────────────────────────────────────────────
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showNewClienteForm, setShowNewClienteForm] = useState(false);
  const [newClienteNombre, setNewClienteNombre] = useState('');
  const [newClienteTelefono, setNewClienteTelefono] = useState('');

  const [servicioId, setServicioId] = useState<number | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [notas, setNotas] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Cargar servicios ───────────────────────────────────
  useEffect(() => {
    api.getServicios().then(setServicios).catch(console.error);
  }, []);

  // ─── Buscar clientes con debounce ───────────────────────
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
        console.error('Error searching clientes:', err);
      }
    }, 300);
  }, []);

  useEffect(() => {
    searchClientes(clienteSearch);
  }, [clienteSearch, searchClientes]);

  // ─── Validación ─────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCliente && !showNewClienteForm) {
      newErrors.cliente = 'Buscá un cliente o creá uno nuevo';
    }
    if (showNewClienteForm && !newClienteNombre.trim()) {
      newErrors.cliente = 'El nombre del cliente es obligatorio';
    }
    if (!servicioId) newErrors.servicio = 'Seleccioná un servicio';
    if (!fecha) newErrors.fecha = 'Seleccioná una fecha';
    if (!hora) newErrors.hora = 'Seleccioná una hora';

    if (fecha) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(fecha + 'T00:00:00');
      if (selectedDate < today) {
        newErrors.fecha = 'La fecha no puede ser en el pasado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let clienteId = selectedCliente?.id;

    // Si es cliente nuevo, crearlo primero
    if (showNewClienteForm && !selectedCliente) {
      try {
        const nuevoCliente = await api.createCliente({
          nombre: newClienteNombre.trim(),
          telefono: newClienteTelefono || undefined,
        });
        clienteId = nuevoCliente.id;
      } catch (err: any) {
        setErrors({ cliente: err.message || 'Error al crear el cliente' });
        return;
      }
    }

    if (!clienteId || !servicioId) return;

    await onSubmit({
      cliente_id: clienteId,
      servicio_id: servicioId,
      fecha,
      hora,
      notas: notas || undefined,
    });

    // Reset
    setClienteSearch('');
    setSelectedCliente(null);
    setShowNewClienteForm(false);
    setNewClienteNombre('');
    setNewClienteTelefono('');
    setServicioId(null);
    setFecha('');
    setHora('');
    setNotas('');
    setErrors({});
  };

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 animate-fade-in"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Nuevo Turno
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* ─── Cliente ─────────────────────────────────────── */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cliente <span className="text-red-500">*</span>
          </label>

          {selectedCliente ? (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <span className="flex-1 text-blue-800 dark:text-blue-200 font-medium">
                {selectedCliente.nombre}
                {selectedCliente.telefono && (
                  <span className="text-sm font-normal ml-2">({selectedCliente.telefono})</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCliente(null);
                  setClienteSearch('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm"
              >
                Cambiar
              </button>
            </div>
          ) : showNewClienteForm ? (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nuevo cliente</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewClienteForm(false);
                    setNewClienteNombre('');
                    setNewClienteTelefono('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ← Volver a buscar
                </button>
              </div>
              <input
                type="text"
                value={newClienteNombre}
                onChange={(e) => setNewClienteNombre(e.target.value)}
                placeholder="Nombre *"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 text-sm"
              />
              <input
                type="tel"
                value={newClienteTelefono}
                onChange={(e) => setNewClienteTelefono(e.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 text-sm"
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-colors ${
                  errors.cliente ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {clientes.length > 0 && (
                <ul className="mt-1 border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-700">
                  {clientes.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCliente(c);
                          setClienteSearch('');
                          setClientes([]);
                          if (errors.cliente) setErrors((prev) => ({ ...prev, cliente: '' }));
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100">{c.nombre}</span>
                        {c.telefono && (
                          <span className="ml-2 text-gray-500 dark:text-gray-400">{c.telefono}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => setShowNewClienteForm(true)}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
              >
                + Crear cliente nuevo
              </button>
            </div>
          )}
          {errors.cliente && (
            <p className="mt-1 text-xs text-red-500">{errors.cliente}</p>
          )}
        </div>

        {/* ─── Servicio ────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Servicio <span className="text-red-500">*</span>
          </label>
          <select
            value={servicioId ?? ''}
            onChange={(e) => {
              setServicioId(Number(e.target.value) || null);
              if (errors.servicio) setErrors((prev) => ({ ...prev, servicio: '' }));
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors ${
              errors.servicio ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} — ${s.precio.toLocaleString('es-AR')}
              </option>
            ))}
          </select>
          {errors.servicio && (
            <p className="mt-1 text-xs text-red-500">{errors.servicio}</p>
          )}
        </div>

        {/* ─── Fecha ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              if (errors.fecha) setErrors((prev) => ({ ...prev, fecha: '' }));
            }}
            min={today}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors ${
              errors.fecha ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.fecha && (
            <p className="mt-1 text-xs text-red-500">{errors.fecha}</p>
          )}
        </div>

        {/* ─── Hora ────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora <span className="text-red-500">*</span>
          </label>
          <select
            value={hora}
            onChange={(e) => {
              setHora(e.target.value);
              if (errors.hora) setErrors((prev) => ({ ...prev, hora: '' }));
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors ${
              errors.hora ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar hora</option>
            {HORAS.map((h) => (
              <option key={h} value={h}>{h} hs</option>
            ))}
          </select>
          {errors.hora && (
            <p className="mt-1 text-xs text-red-500">{errors.hora}</p>
          )}
        </div>

        {/* ─── Notas ───────────────────────────────────────── */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: quiere con Maxi, pelo rizado..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Creando...</span>
          </>
        ) : (
          'Crear Turno'
        )}
      </button>
    </form>
  );
}
