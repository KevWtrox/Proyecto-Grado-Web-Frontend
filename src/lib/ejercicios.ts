import { ejerciciosApi } from './ejerciciosApi';
import type {
  EjercicioListResponse,
  Ejercicio,
  CrearEjercicioRequest,
  ActualizarEjercicioRequest,
} from './types';

export async function getEjercicios(
  pagina: number = 1,
  limite: number = 20,
  tipo?: string | null,
  categoria_id?: string | null,
  activo?: boolean | null
): Promise<EjercicioListResponse> {
  const params = new URLSearchParams({
    pagina: pagina.toString(),
    limite: limite.toString(),
  });

  if (tipo) params.append('tipo', tipo);
  if (categoria_id) params.append('categoria_id', categoria_id);
  if (activo !== null && activo !== undefined) params.append('activo', activo.toString());

  const { data } = await ejerciciosApi.get<EjercicioListResponse>(`/ejercicios/?${params.toString()}`);
  return data;
}

export async function getEjercicio(id: string): Promise<Ejercicio> {
  const { data } = await ejerciciosApi.get<Ejercicio>(`/ejercicios/${id}`);
  return data;
}

export async function crearEjercicio(datos: CrearEjercicioRequest): Promise<Ejercicio> {
  const { data } = await ejerciciosApi.post<Ejercicio>('/ejercicios/', datos);
  return data;
}

export async function actualizarEjercicio(id: string, datos: ActualizarEjercicioRequest): Promise<Ejercicio> {
  const { data } = await ejerciciosApi.patch<Ejercicio>(`/ejercicios/${id}`, datos);
  return data;
}

export async function desactivarEjercicio(id: string): Promise<{ mensaje: string }> {
  const { data } = await ejerciciosApi.delete<{ mensaje: string }>(`/ejercicios/${id}`);
  return data;
}

export function getPartituraUrl(id: string): string {
  const base = import.meta.env.VITE_EXERCISES_BACKEND_URL || 'http://127.0.0.1:8002';
  return `${base}/ejercicios/${id}/partitura`;
}
