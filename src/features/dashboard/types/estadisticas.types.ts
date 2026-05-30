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
