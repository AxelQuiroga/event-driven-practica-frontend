import { useEffect } from 'react';
import { eventBus } from '../lib/eventBus';

/**
 * Hook para suscribirse a eventos del EventBus con cleanup automático
 *
 * @example
 * useEventBus('turnoCreado', (turno) => {
 *   console.log('Nuevo turno:', turno);
 * });
 */
export function useEventBus(event: string, callback: (data: any) => void): void {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(event, callback);
    return unsubscribe;
  }, [event, callback]);
}
