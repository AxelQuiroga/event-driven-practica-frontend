/**
 * Event Bus - Singleton Pub/Sub pattern (misma implementación que el backend)
 *
 * Permite comunicación desacoplada entre componentes.
 * Úsalo para eventos como: turnoCreado, turnoEliminado, mostrarToast, etc.
 */
type Callback = (data: any) => void;

class EventBus {
  private static instance: EventBus;
  private events: Map<string, Set<Callback>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /** Suscribirse a un evento. Retorna función para desuscribirse. */
  subscribe(event: string, callback: Callback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    return () => {
      this.events.get(event)?.delete(callback);
    };
  }

  /** Publicar un evento a todos los suscriptores */
  publish(event: string, data: any): void {
    this.events.get(event)?.forEach((cb) => cb(data));
  }

  /** Eliminar una suscripción específica */
  unsubscribe(event: string, callback: Callback): void {
    this.events.get(event)?.delete(callback);
  }

  /** Limpiar todas las suscripciones (útil para testing) */
  clear(): void {
    this.events.clear();
  }
}

export const eventBus = EventBus.getInstance();
