import { useState, useEffect, useCallback } from 'react';
import { eventBus } from '../../lib/eventBus';

/** Tipos de toasts disponibles */
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-white',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

/**
 * Muestra un toast programáticamente desde cualquier parte de la app:
 *
 * @example
 * eventBus.publish('toast:show', { type: 'success', message: 'Turno creado!' })
 */
export function showToast(type: ToastType, message: string) {
  eventBus.publish('toast:show', { type, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((data: { type: ToastType; message: string }) => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type: data.type, message: data.message }]);

    // Auto-remover después de 3.5 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    const unsub = eventBus.subscribe('toast:show', addToast);
    return unsub;
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in cursor-pointer`}
          onClick={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }
          role="alert"
        >
          <span className="font-bold text-lg">{typeIcons[toast.type]}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
