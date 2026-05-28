import { ejerciciosApi } from '@/core/http/ejerciciosApi';
import type { EjerciciosEstudianteResponse } from '@/features/practicas/types/practicas.types';

const GATEWAY = (
  import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'
).replace(/\/$/, '');

/**
 * Normaliza cualquier URL de media al gateway actual.
 * - Rutas relativas (/static/...) → se preprende GATEWAY
 * - URLs absolutas con host distinto (túnel Cloudflare viejo) → se reemplaza el host
 * - URLs del gateway actual → se devuelven sin cambios
 */
export function buildMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `${GATEWAY}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  try {
    const parsed = new URL(url);
    const gateway = new URL(GATEWAY);
    if (parsed.host !== gateway.host) {
      return `${GATEWAY}${parsed.pathname}`;
    }
  } catch {
    // URL malformada, devolver como está
  }
  return url;
}

// Formatos soportados por el backend de audio, en orden de preferencia (.wav es el default)
const AUDIO_EXTS: { ext: string; mime: string }[] = [
  { ext: 'wav',  mime: 'audio/wav' },
  { ext: 'ogg',  mime: 'audio/ogg' },
  { ext: 'mp3',  mime: 'audio/mpeg' },
  { ext: 'm4a',  mime: 'audio/mp4' },
  { ext: 'webm', mime: 'audio/webm' },
  { ext: 'flac', mime: 'audio/flac' },
];

/**
 * Para registros históricos donde audio_url apunta al espectrograma PNG,
 * devuelve candidatos de audio para todos los formatos posibles.
 * Acepta tanto URLs absolutas como rutas relativas.
 * El navegador usará el primero que el servidor responda correctamente.
 */
export function deriveAudioCandidates(
  spectrogramUrl: string,
): { src: string; type: string }[] {
  try {
    const pathname =
      spectrogramUrl.startsWith('http://') || spectrogramUrl.startsWith('https://')
        ? new URL(spectrogramUrl).pathname
        : spectrogramUrl;
    const filename = pathname.split('/').pop();
    if (!filename) return [];
    const specId = filename.replace(/\.[^.]+$/, '');
    return AUDIO_EXTS.map(({ ext, mime }) => ({
      src: `${GATEWAY}/static/audio/${specId}.${ext}`,
      type: mime,
    }));
  } catch {
    return [];
  }
}

export const practicasService = {
  getEjerciciosEstudiante: async (estudianteId: string): Promise<EjerciciosEstudianteResponse> => {
    const { data } = await ejerciciosApi.get<EjerciciosEstudianteResponse>(
      `/resultados/estudiante/${estudianteId}/ejercicios`,
    );
    return data;
  },
};
