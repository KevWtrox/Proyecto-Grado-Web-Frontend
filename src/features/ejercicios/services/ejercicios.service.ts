import { ejerciciosApi } from '@/core/http/ejerciciosApi';
import type {
  Ejercicio,
  EjercicioListResponse,
  CrearEjercicioRequest,
  ActualizarEjercicioRequest,
} from '@/features/ejercicios/types/ejercicios.types';

export const ejerciciosService = {
  getAll: async (
    pagina = 1,
    limite = 20,
    tipo?: string | null,
    categoria_id?: string | null,
    activo?: boolean | null
  ): Promise<EjercicioListResponse> => {
    const params = new URLSearchParams({ pagina: pagina.toString(), limite: limite.toString() });
    if (tipo) params.append('tipo', tipo);
    if (categoria_id) params.append('categoria_id', categoria_id);
    if (activo !== null && activo !== undefined) params.append('activo', activo.toString());
    const { data } = await ejerciciosApi.get<EjercicioListResponse>(`/ejercicios/?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Ejercicio> => {
    const { data } = await ejerciciosApi.get<Ejercicio>(`/ejercicios/${id}`);
    return data;
  },

  create: async (datos: CrearEjercicioRequest): Promise<Ejercicio> => {
    const { data } = await ejerciciosApi.post<Ejercicio>('/ejercicios/', datos);
    return data;
  },

  update: async (id: string, datos: ActualizarEjercicioRequest): Promise<Ejercicio> => {
    const { data } = await ejerciciosApi.patch<Ejercicio>(`/ejercicios/${id}`, datos);
    return data;
  },

  remove: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await ejerciciosApi.delete<{ mensaje: string }>(`/ejercicios/${id}`);
    return data;
  },

  getPartituraUrl: (id: string): string => {
    const base = import.meta.env.VITE_EXERCISES_BACKEND_URL || 'http://127.0.0.1:8002';
    return `${base}/ejercicios/${id}/partitura`;
  },
};

// Alias funcionales para compatibilidad con páginas existentes
export const getEjercicios = ejerciciosService.getAll;
export const getEjercicio = ejerciciosService.getById;
export const crearEjercicio = ejerciciosService.create;
export const actualizarEjercicio = ejerciciosService.update;
export const desactivarEjercicio = ejerciciosService.remove;
export const getPartituraUrl = ejerciciosService.getPartituraUrl;
