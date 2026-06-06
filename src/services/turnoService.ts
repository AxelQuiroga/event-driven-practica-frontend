/**
 * Capa de servicios para la API de turnos
 * Centraliza todas las llamadas HTTP al backend
 */

export interface Turno {
  id: number;
  nombre: string;
  servicio: string;
  fecha: string;
  hora: string;
  created_at?: string;
}

export interface CreateTurnoDTO {
  nombre: string;
  servicio: string;
  fecha: string;
  hora: string;
}

const BASE_URL = '/api';

class TurnoService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getAll(): Promise<Turno[]> {
    return this.request<Turno[]>('/turnos');
  }

  async create(data: CreateTurnoDTO): Promise<Turno> {
    return this.request<Turno>('/turnos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    await this.request(`/turnos/${id}`, { method: 'DELETE' });
  }
}

export const turnoService = new TurnoService();
