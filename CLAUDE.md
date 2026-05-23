# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AudioLearn is an administrative web panel for the "Conservatorio Plurinacional de Música". It manages students, instructors, and solfège practice exercises. The system has two separate FastAPI backends and one React frontend:

- **Auth/Users backend** — runs on port 8001 (not in this repo)
- **Exercises backend** — runs on port 8002 (`solfeoapp-exercises`)
- **Web frontend** — this repo (React + Vite)

## Frontend Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

Requires Node ≥ 18, npm ≥ 9.

## Environment Variables

Create a `.env` file at the root:

```env
VITE_BACKEND_URL=http://localhost:8001
VITE_EXERCISES_BACKEND_URL=http://localhost:8002/api/v1/
```

## Frontend Architecture

**Stack:** React 19 + TypeScript 5, Vite, React Router 7, Zustand, TanStack Query, Axios, React Hook Form + Zod, Tailwind CSS 4, Base UI + shadcn/ui, Sonner (toasts).

**Path alias:** `@/` maps to `src/`.

### State and Data Fetching

- **Zustand** (`src/lib/userStore.ts`) — stores the authenticated user, persisted to `localStorage`.
- **React Query** — owns all server state. Uses keys like `['usuarios', pagina, filtro]`. Mutations manually invalidate relevant queries after success.

### API Layer (`src/lib/`)

| File | Purpose |
|------|---------|
| `api.ts` | Axios instance for port 8001. Interceptor injects `Authorization: Bearer` from localStorage; 401 triggers logout + redirect. |
| `ejerciciosApi.ts` | Separate Axios instance for port 8002 (same interceptor pattern). |
| `auth.ts` | `login()` / `logout()` — calls `/auth/login`, then `/auth/me`, stores user in Zustand. Has a `MOCK_MODE` flag for testing without a backend. |
| `usuarios.ts` | User CRUD (list, create, update). Soft-delete only (`activo: false`). |
| `ejercicios.ts` | Exercise CRUD against port 8002. |
| `categorias.ts` | Category CRUD against port 8002. |
| `types.ts` | All TypeScript interfaces: `Usuario`, `Estudiante`, `Categoria`, `Ejercicio`, `Resultado`, etc. |

### Routing

Routes are defined in `src/App.tsx` and all protected routes use a `ProtectedRoute` wrapper that reads the Zustand store.

| Route | Page | Auth |
|-------|------|------|
| `/login` | LoginPage | No |
| `/dashboard` | DashboardPage | Yes |
| `/estudiantes` | EstudiantesPage | Yes |
| `/ejercicios` | EjerciciosPage | Yes |
| `*` | Redirect → `/login` | — |

### UI Conventions

- `src/components/ui/` holds headless Base UI primitives styled with Tailwind. Variants are defined with CVA (Class Variance Authority).
- `cn()` utility in `src/lib/utils.ts` wraps `clsx` + `tailwind-merge`.
- Design tokens (colors, fonts) are defined as CSS variables in `src/index.css` using OKLCH color space. Primary: dark green `#2d5a3d`, background: beige `#f5f0e6`.

## Exercises Backend (`solfeoapp-exercises`)

FastAPI app. Relevant directories in this workspace:

- `app/schemas/` — Pydantic v2 models for `Categoria`, `Ejercicio`, `Resultado`
- `app/routers/` — Route handlers for `/categorias`, `/ejercicios`, `/resultados`, `/partituras`

### Key Domain Rules

- **Ejercicio structure:** each exercise has exactly 4 `Compas` (measures), each with exactly 4 notes. Notes accept Spanish (Do, Re, Mi…) or English (C, D, E…) notation with `#`/`b` accidentals.
- **Score generation:** `GET /ejercicios/{id}` dynamically renders and returns a base64-encoded PNG of the musical notation.
- **Soft delete:** both categories and exercises deactivate (`activo: false`) rather than hard-delete.
- **Pagination:** all list endpoints use `PaginationParams` (page, limit) and return `{ total, pagina, limite, items }`.
- **Student context:** results endpoints take `estudiante_id` as a query parameter. Role-based auth (student `/me/` vs. teacher `/estudiante/{id}/`) is scaffolded but currently commented out.

### Exercise Types

`tipo` field options: `entonacion`, `ritmo`, `dictado`, `lectura_vista`, `identificacion`.
