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

    // 1. Parseamos el JSON de forma segura al inicio (si es que hay contenido)
    const isNoContent = response.status === 204;
    const data = isNoContent ? {} : await response.json().catch(() => ({}));

    // 2. Si la respuesta no es exitosa, procesamos el objeto 'data' que ya tenemos
    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        const mensajeCombinado = data.errors
          .map((err: { campo: string; mensaje: string }) => `${err.campo}: ${err.mensaje}`)
          .join(', ');
        
        throw new Error(mensajeCombinado);
      }

      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
    }

    // 3. Si todo salió bien, devolvemos la data parseada
    return data as T;
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
