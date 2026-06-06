import { useEffect, useRef } from 'react';
import { eventBus } from '../lib/eventBus';

/**
 * Hook que conecta al endpoint SSE del backend y re-publica
 * los eventos en el EventBus del frontend.
 *
 * Cuando el backend emite 'turnoCreado' o 'turnoEliminado',
 * este hook los recibe y los publica en el eventBus local
 * para que cualquier componente suscrito reaccione.
 */
export function useSSE(): void {
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let shouldReconnect = true;

    function connect() {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          switch (parsed.type) {
            case 'turnoCreado':
              eventBus.publish('sse:turnoCreado', parsed.data);
              break;
            case 'turnoEliminado':
              eventBus.publish('sse:turnoEliminado', parsed.data);
              break;
            case 'connected':
              console.log('[SSE] Conectado al servidor de eventos');
              break;
            default:
              console.log('[SSE] Evento desconocido:', parsed.type);
          }
        } catch (e) {
          console.error('[SSE] Error parseando evento:', e);
        }
      };

      eventSource.onerror = () => {
        console.error('[SSE] Error de conexión. Reconectando en 3s...');
        eventSource?.close();

        if (shouldReconnect) {
          reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      eventSource?.close();
    };
  }, []);
}
