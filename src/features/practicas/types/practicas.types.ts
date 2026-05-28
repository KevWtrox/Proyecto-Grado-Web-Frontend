export type IntentoDetalle = {
  resultado_id: string;
  numero_intento: number;
  fecha_intento: string;
  puntuacion: number;
  precision_porcentaje: number;
  duracion_segundos: number;
  aprobado: boolean;
  audio_url: string | null;
  notas_detectadas: string[] | null;
  bpm_detectado: number | null;
  calidad_grabacion: number | null;
  retroalimentacion: {
    mensaje_principal?: string;
    errores?: string[];
    sugerencias?: string[];
    notas_correctas?: number;
    notas_incorrectas?: number;
    puntos_ganados?: number;
  };
};

export type EjercicioConIntentos = {
  ejercicio_id: string;
  titulo: string;
  tipo: string;
  categoria_id: string;
  bpm_referencia: number;
  compas: string;
  total_intentos: number;
  mejor_puntuacion: number;
  aprobado: boolean;
  intentos: IntentoDetalle[];
};

export type EjerciciosEstudianteResponse = {
  estudiante_id: string;
  total_ejercicios: number;
  ejercicios: EjercicioConIntentos[];
};
