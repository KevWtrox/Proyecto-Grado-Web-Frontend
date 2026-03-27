export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  mencion: string;
  paralelo: number;
  fecha_registro: string;
  activo: boolean;
}

export type LoginResponse = TokenResponse & {
  user: Usuario;
}

export type Estudiante = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  mencion: string;
  paralelo: number;
  puntuacion: number;
  ejercicios_completados: number;
}

export type PracticaDiaria = {
  fecha: string;
  cantidad: number;
}

export type EjercicioRealizado = {
  id: string;
  nombre: string;
  puntuacion: number;
  fecha: string;
}
