import { useState } from 'react';

interface TurnoFormProps {
  onSubmit: (data: { nombre: string; servicio: string; fecha: string; hora: string }) => Promise<void>;
  isLoading: boolean;
}

const SERVICIOS = [
  'Corte de pelo',
  'Corte y barba',
  'Barba',
  'Tinte',
  'Lavado',
  'Peinado',
  'Corte infantil',
  'Alisado',
];

export function TurnoForm({ onSubmit, isLoading }: TurnoFormProps) {
  const [nombre, setNombre] = useState('');
  const [servicio, setServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!servicio) newErrors.servicio = 'Seleccioná un servicio';
    if (!fecha) newErrors.fecha = 'Seleccioná una fecha';
    if (!hora) newErrors.hora = 'Seleccioná una hora';

    // Validar que la fecha no sea pasada
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      nombre: nombre.trim(),
      servicio,
      fecha,
      hora,
    });

    // Reset form on success
    setNombre('');
    setServicio('');
    setFecha('');
    setHora('');
    setErrors({});
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 animate-fade-in"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Nuevo Turno
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
            }}
            placeholder="Nombre del cliente"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-colors ${
              errors.nombre ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
          )}
        </div>

        {/* Servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Servicio <span className="text-red-500">*</span>
          </label>
          <select
            value={servicio}
            onChange={(e) => {
              setServicio(e.target.value);
              if (errors.servicio) setErrors((prev) => ({ ...prev, servicio: '' }));
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors ${
              errors.servicio ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar servicio</option>
            {SERVICIOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.servicio && (
            <p className="mt-1 text-xs text-red-500">{errors.servicio}</p>
          )}
        </div>

        {/* Fecha */}
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
              errors.fecha ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fecha && (
            <p className="mt-1 text-xs text-red-500">{errors.fecha}</p>
          )}
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={hora}
            onChange={(e) => {
              setHora(e.target.value);
              if (errors.hora) setErrors((prev) => ({ ...prev, hora: '' }));
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors ${
              errors.hora ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.hora && (
            <p className="mt-1 text-xs text-red-500">{errors.hora}</p>
          )}
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
