export type IntentosDiaSemana = {
  dia_num: number;       // 1=Domingo … 7=Sábado (convención MongoDB)
  dia_nombre: string;    // "Lunes", "Martes", …
  intentos: number;
};

export type IntentosPorDiaSemanaResponse = {
  desde: string;         // ISO datetime UTC
  hasta: string;
  modo: string;          // "completado"
  total: number;
  dias: IntentosDiaSemana[];
};

export type RankingItem = {
  posicion: number;
  usuario_id: string;
  nombre: string;
  apellido: string;
  paralelo: number | null;
  puntos_totales: number;
  nivel_actual: number;
  ejercicios_completados: number;
};

export type IntentoReciente = {
  resultado_id: string;
  estudiante_id: string | null;
  ejercicio_id: string | null;
  fecha_intento: string;
  puntuacion: number;
  precision_porcentaje: number;
  duracion_segundos: number;
  aprobado: boolean;
  numero_intento: number;
  modo: string;
  ejercicio_titulo: string | null;
  ejercicio_tipo: string | null;
  ejercicio_compas: string | null;
  ejercicio_bpm_referencia: number | null;
};
