export type EstadoUsuario = 'pendiente' | 'aprobado' | 'rechazado';
export type Genero = 'M' | 'F';

export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  ci?: string;
  genero?: Genero;
  mencion?: string;
  paralelo?: number;
  estado: EstadoUsuario;
  motivo_registro?: string;
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
  genero: Genero;
  ci?: string;
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
