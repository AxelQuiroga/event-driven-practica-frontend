import { useEffect, useRef } from 'react';
import { eventBus } from '../lib/eventBus';

/**
 * Hook para suscribirse a eventos del EventBus con cleanup automático.
 *
 * Usa una ref para el callback: así NUNCA se re-subscribe cuando el callback cambia,
 * evitando perder eventos entre el cleanup y el setup del effect.
 *
 * @example
 * useEventBus('turnoCreado', (turno) => {
 *   console.log('Nuevo turno:', turno);
 * });
 */
export function useEventBus(event: string, callback: (data: any) => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const stableCallback = (data: any) => callbackRef.current(data);
    const unsubscribe = eventBus.subscribe(event, stableCallback);
    return unsubscribe;
  }, [event]);
}
