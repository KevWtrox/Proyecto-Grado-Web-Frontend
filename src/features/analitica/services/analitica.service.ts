import { ejerciciosApi } from '@/core/http/ejerciciosApi';
import type {
  AnalisisResultadoCompleto,
  CurvaAprendizajeResponse,
  EjerciciosEstudianteCNNResponse,
  MatrizConfusionResponse,
  MetricasEstudianteCNN,
  ModelArchitectureInfo,
  NSynthDatasetInfo,
  PreprocessingParams,
  ResumenAnaliticaGlobal,
} from '@/features/analitica/types/analitica.types';

export const analiticaService = {
  getModeloInfo: async (): Promise<ModelArchitectureInfo> => {
    const { data } = await ejerciciosApi.get<ModelArchitectureInfo>('/analitica/modelo/info');
    return data;
  },
  getDatasetInfo: async (): Promise<NSynthDatasetInfo> => {
    const { data } = await ejerciciosApi.get<NSynthDatasetInfo>('/analitica/dataset/info');
    return data;
  },
  getPreprocessing: async (): Promise<PreprocessingParams> => {
    const { data } = await ejerciciosApi.get<PreprocessingParams>('/analitica/preprocessing/params');
    return data;
  },
  getResumenGlobal: async (): Promise<ResumenAnaliticaGlobal> => {
    const { data } = await ejerciciosApi.get<ResumenAnaliticaGlobal>('/analitica/resumen-global');
    return data;
  },
  getAnalisisResultado: async (resultadoId: string): Promise<AnalisisResultadoCompleto> => {
    const { data } = await ejerciciosApi.get<AnalisisResultadoCompleto>(`/analitica/resultado/${resultadoId}`);
    return data;
  },
  getEjerciciosEstudiante: async (estudianteId: string): Promise<EjerciciosEstudianteCNNResponse> => {
    const { data } = await ejerciciosApi.get<EjerciciosEstudianteCNNResponse>(
      `/analitica/estudiante/${estudianteId}/ejercicios`,
    );
    return data;
  },
  getMatrizConfusion: async (estudianteId: string): Promise<MatrizConfusionResponse> => {
    const { data } = await ejerciciosApi.get<MatrizConfusionResponse>(
      `/analitica/estudiante/${estudianteId}/matriz-confusion`,
    );
    return data;
  },
  getMetricas: async (estudianteId: string): Promise<MetricasEstudianteCNN> => {
    const { data } = await ejerciciosApi.get<MetricasEstudianteCNN>(
      `/analitica/estudiante/${estudianteId}/metricas`,
    );
    return data;
  },
  getCurvaAprendizaje: async (estudianteId: string): Promise<CurvaAprendizajeResponse> => {
    const { data } = await ejerciciosApi.get<CurvaAprendizajeResponse>(
      `/analitica/estudiante/${estudianteId}/curva-aprendizaje`,
    );
    return data;
  },
};
