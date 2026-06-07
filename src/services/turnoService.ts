/**
 * Capa de servicios para la API de peluquería
 * Centraliza todas las llamadas HTTP al backend
 */

// ─── Types ────────────────────────────────────────────────

export type TurnoEstado = 'pending' | 'completed' | 'cancelled';

export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
}

export interface Turno {
  id: number;
  cliente_id: number;
  servicio_id: number;
  fecha: string;
  hora: string;
  estado: TurnoEstado;
  notas: string | null;
  created_at?: string;
  updated_at?: string;
  // Join fields (from TurnoConDetalles)
  cliente_nombre: string;
  servicio_nombre: string;
  servicio_precio: number;
}

export interface CreateTurnoDTO {
  cliente_id: number;
  servicio_id: number;
  fecha: string;
  hora: string;
  notas?: string;
}

export interface UpdateTurnoDTO {
  cliente_id?: number;
  servicio_id?: number;
  fecha?: string;
  hora?: string;
  notas?: string;
}

export interface CreateClienteDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
}

// ─── Service ──────────────────────────────────────────────

const BASE_URL = '/api';

class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const isNoContent = response.status === 204;
    const data = isNoContent ? {} : await response.json().catch(() => ({}));

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        const mensajeCombinado = data.errors
          .map((err: { campo: string; mensaje: string }) => `${err.campo}: ${err.mensaje}`)
          .join(', ');
        throw new Error(mensajeCombinado);
      }
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
    }

    return data as T;
  }

  // ─── Turnos ──────────────────────────────────────────────

  async getTurnos(fecha?: string): Promise<Turno[]> {
    const query = fecha ? `?fecha=${fecha}` : '';
    return this.request<Turno[]>(`/turnos${query}`);
  }

  async getTurnoById(id: number): Promise<Turno> {
    return this.request<Turno>(`/turnos/${id}`);
  }

  async createTurno(data: CreateTurnoDTO): Promise<Turno> {
    return this.request<Turno>('/turnos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTurno(id: number, data: UpdateTurnoDTO): Promise<Turno> {
    return this.request<Turno>(`/turnos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateTurnoEstado(id: number, estado: TurnoEstado): Promise<Turno> {
    return this.request<Turno>(`/turnos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  async deleteTurno(id: number): Promise<void> {
    await this.request(`/turnos/${id}`, { method: 'DELETE' });
  }

  // ─── Clientes ────────────────────────────────────────────

  async getClientes(search?: string): Promise<Cliente[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Cliente[]>(`/clientes${query}`);
  }

  async getClienteById(id: number): Promise<Cliente> {
    return this.request<Cliente>(`/clientes/${id}`);
  }

  async createCliente(data: CreateClienteDTO): Promise<Cliente> {
    return this.request<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ─── Servicios ───────────────────────────────────────────

  async getServicios(): Promise<Servicio[]> {
    return this.request<Servicio[]>('/servicios');
  }
}

export const api = new ApiService();
