import { ejerciciosApi } from '@/core/http/ejerciciosApi';
import type { IntentosPorDiaSemanaResponse } from '@/features/dashboard/types/estadisticas.types';

export const estadisticasService = {
  getIntentosPorDiaSemana: async (): Promise<IntentosPorDiaSemanaResponse> => {
    const { data } = await ejerciciosApi.get<IntentosPorDiaSemanaResponse>(
      '/resultados/estadisticas/por-dia-semana',
    );
    return data;
  },
};

export const getIntentosPorDiaSemana = estadisticasService.getIntentosPorDiaSemana;
