# AudioLearn — Frontend Web

Panel administrativo del sistema **AudioLearn** para el Conservatorio Plurinacional de Música. Permite gestionar usuarios (estudiantes e instructores), visualizar estadísticas de práctica y administrar ejercicios de audio.

---

## Tecnologías principales

| Categoría | Librería / Herramienta | Versión |
|---|---|---|
| Framework | React | 19.2.4 |
| Lenguaje | TypeScript | 5.9.3 |
| Build tool | Vite | 8.0.1 |
| Routing | React Router | 7.13.2 |
| Estado global | Zustand | 5.0.12 |
| Estado servidor | TanStack React Query | 5.95.2 |
| HTTP | Axios | 1.14.0 |
| Formularios | React Hook Form + Zod | 7.72.0 / 4.3.6 |
| UI base | Base UI + shadcn/ui | 1.3.0 / 4.1.1 |
| Estilos | Tailwind CSS | 4.2.2 |
| Iconos | Lucide React | 1.7.0 |
| Notificaciones | Sonner | 2.0.7 |

---

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Backend corriendo en `http://localhost:8001` (o configurado vía `.env`)

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_BACKEND_URL=http://localhost:8001
```

Si la variable no está definida, el cliente usa `http://localhost:8001` por defecto.

---

## Estructura del proyecto

```
src/
├── main.tsx                  # Punto de entrada React
├── App.tsx                   # Rutas + providers globales
├── index.css                 # Configuración global de Tailwind
├── pages/
│   ├── LoginPage.tsx         # Autenticación
│   ├── DashboardPage.tsx     # Dashboard con analíticas
│   └── EstudiantesPage.tsx   # CRUD completo de usuarios
├── components/
│   └── ui/
│       ├── button.tsx        # Botón con variantes CVA
│       ├── card.tsx          # Tarjeta compuesta
│       ├── input.tsx         # Input accesible
│       └── label.tsx         # Label de formulario
└── lib/
    ├── api.ts                # Instancia Axios + interceptores de auth
    ├── auth.ts               # login / logout / getCurrentUser
    ├── userStore.ts          # Store Zustand persistido en localStorage
    ├── usuarios.ts           # CRUD de usuarios contra la API
    ├── types.ts              # Interfaces y tipos TypeScript
    └── utils.ts              # Helper cn() para clases de Tailwind
```

---

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | LoginPage | Público |
| `/dashboard` | DashboardPage | Autenticado |
| `/estudiantes` | EstudiantesPage | Autenticado |
| `*` | Redirect a `/login` | — |

Las rutas protegidas utilizan el componente `ProtectedRoute`, que verifica la presencia del usuario en el store de Zustand.

---

## Autenticación

1. El usuario ingresa correo y contraseña en `/login`.
2. Se llama a `POST /auth/login` → se almacenan `access_token` y `refresh_token` en `localStorage`.
3. Se obtiene el perfil del usuario con `GET /auth/me` y se guarda en el store de Zustand.
4. Todos los requests siguientes incluyen el header `Authorization: Bearer {token}` (inyectado automáticamente por el interceptor de Axios).
5. Si algún request retorna `401`, se limpia la sesión y se redirige a `/login`.

---

## Estado de la aplicación

### Estado del cliente — Zustand

```ts
useUserStore:
  user: Usuario | null     // persistido en localStorage
  setUser(user): void
  clearUser(): void
```

### Estado del servidor — TanStack React Query

- Query key principal: `['usuarios', pagina, filtroRol, filtroActivo]`
- Invalidación manual después de mutaciones (crear, editar, eliminar).
- Notificaciones de éxito/error mediante Sonner toast.

---

## Endpoints consumidos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Obtener usuario actual |
| GET | `/usuarios/` | Listar usuarios (paginación + filtros) |
| GET | `/usuarios/{id}` | Obtener usuario por ID |
| POST | `/usuarios/` | Crear usuario |
| PATCH | `/usuarios/{id}` | Actualizar usuario |
| PATCH | `/usuarios/{id}` | Eliminación suave (`activo: false`) |

---

## Tipos principales

```ts
interface Usuario {
  id: number
  nombre: string
  apellido: string
  correo: string
  rol: 'admin' | 'estudiante'
  mencion?: string
  paralelo?: string
  fecha_registro: string
  activo: boolean
}

interface UsuarioListResponse {
  total: number
  pagina: number
  limite: number
  datos: Usuario[]
}
```

---

## Diseño y sistema de colores

El diseño sigue una identidad de conservatorio musical con colores naturales:

| Token | Valor | Uso |
|---|---|---|
| Verde oscuro | `#2d5a3d` | Sidebar, botones primarios |
| Verde medio | `#3d7a52` | Estados hover |
| Beige claro | `#f5f0e6` | Fondo principal |
| Tan / Arena | `#c4b896` | Bordes, acentos |
| Oro | `#d4a84b` | Medalla 1er lugar |
| Plata | `#a8a8a8` | Medalla 2do lugar |
| Bronce | `#cd7f32` | Medalla 3er lugar |

---

## Patrones destacados

- **CVA (Class Variance Authority):** El componente `Button` define variantes (`default`, `outline`, `destructive`, etc.) y tamaños (`sm`, `lg`, `icon`) de forma type-safe.
- **Compound Components:** `Card` expone sub-componentes (`CardHeader`, `CardContent`, `CardFooter`, etc.) para composición flexible.
- **Soft Delete:** Eliminar un usuario establece `activo: false` en lugar de borrar el registro, preservando el historial.
- **Mock Mode:** Constante `MOCK_MODE` en `auth.ts` y `usuarios.ts` permite desarrollar sin backend real (simula delays de 500–1000 ms).
- **Interceptor centralizado:** Un único interceptor de Axios maneja la inyección del token y la redirección por sesión expirada en toda la aplicación.

---

## Alias de importación

El alias `@` apunta a `./src`:

```ts
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

---

## Licencia

Proyecto académico — Conservatorio Plurinacional de Música.
