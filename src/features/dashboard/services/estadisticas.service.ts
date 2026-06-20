import { api } from '@/core/http/api';
import { ejerciciosApi } from '@/core/http/ejerciciosApi';
import type {
  IntentoReciente,
  IntentosPorDiaSemanaResponse,
  RankingItem,
} from '@/features/dashboard/types/estadisticas.types';

export const estadisticasService = {
  getIntentosPorDiaSemana: async (): Promise<IntentosPorDiaSemanaResponse> => {
    const { data } = await ejerciciosApi.get<IntentosPorDiaSemanaResponse>(
      '/resultados/estadisticas/por-dia-semana',
    );
    return data;
  },

  // Ranking — auth backend (port 8001) vía gateway: /estudiantes/ranking
  getRanking: async (paralelo?: number | null, limite = 10): Promise<RankingItem[]> => {
    const params = new URLSearchParams({ limite: limite.toString() });
    if (paralelo != null) params.append('paralelo', paralelo.toString());
    const { data } = await api.get<RankingItem[]>(`/estudiantes/ranking?${params}`);
    return data;
  },

  // Últimos intentos registrados — exercises backend
  getIntentosRecientes: async (limite = 5): Promise<IntentoReciente[]> => {
    const { data } = await ejerciciosApi.get<IntentoReciente[]>(
      `/resultados/recientes?limite=${limite}`,
    );
    return data;
  },
};

export const getIntentosPorDiaSemana = estadisticasService.getIntentosPorDiaSemana;
