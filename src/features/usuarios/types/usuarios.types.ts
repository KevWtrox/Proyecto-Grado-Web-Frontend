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
};

export type UsuarioListResponse = {
  total: number;
  pagina: number;
  limite: number;
  datos: Usuario[];
};

export type CrearUsuarioRequest = {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rol: string;
  mencion?: string;
  paralelo?: number;
};

export type ActualizarUsuarioRequest = {
  nombre?: string;
  apellido?: string;
  mencion?: string;
  paralelo?: number;
  activo?: boolean;
};
