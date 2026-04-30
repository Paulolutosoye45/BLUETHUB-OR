# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # all apps
pnpm web:dev          # web app only (port 5173)
pnpm landing:dev      # landing page only (port 3001)

# Build
pnpm build
pnpm turbo build --filter=@bluethub/web
pnpm turbo build --filter=@bluethub/landing

# Quality
pnpm lint
pnpm check-types
pnpm format
```

## Monorepo Structure

Turborepo + pnpm workspaces. Two apps, three shared packages:

- `apps/web` — main e-learning platform (React 19 + Vite + TypeScript)
- `apps/landing` — static marketing page (React + Vite, minimal deps)
- `packages/ui` (`@bluethub/ui-kit`) — shared component library (shadcn/Radix UI)
- `packages/eslint-config` — shared ESLint config
- `packages/typescript-config` — shared TypeScript configs (`base`, `nextjs`, `react-library`)

## apps/web Architecture

### Routing & Role Model

React Router v7. Routes are defined in `apps/web/src/routes/index.tsx`. Three role-gated areas:

| Path | Guard | Roles |
|------|-------|-------|
| `/admin` | `AdminProtectedRoute` | `SuperAdministrator`, `Administrator` |
| `/student` | `StudentProtectedRoute` | student role |
| `/teacher` | none (implicit) | teacher role |
| `/auth` | `PublicRoute` (redirects if already authed) | — |
| `/teacher/board` | none | live interactive whiteboard (Konva) |
| `/replay` | none | class replay viewer |

### Authentication

`AuthContext` (`src/contexts/auth-context.tsx`) is the source of truth for the logged-in user. On mount it reads `token` from localStorage, parses the JWT, fetches fresh user data via `authService.getUserById`, and hydrates `user` state.

- Access token → `localStorage.token`
- Refresh token → `localStorage.refreshToken`
- School info → `localStorage.schoolInfo`
- Passwords are **SHA-256 hashed client-side** (`utils/Hashing`) before being sent to the API.

Use `useAuthContext()` to access `user`, `isAuthenticated`, `login`, `logout`, `refreshUser`.

### Two Axios Instances (Important)

There are **two separate Axios instances**:

1. `services/index.ts` → `API` — shared instance, attaches Bearer token from localStorage. Used by most services.
2. `services/auth.ts` → also named `API` (local) — has the **token refresh interceptor** (queues 401s, calls `/api/User/refresh-token`, retries). Auth service imports from this local instance.

Do not mix them up. The refresh logic lives only in `services/auth.ts`.

### State Management

Redux Toolkit with a **single slice**: `src/store/class-action-slice.ts`.

This slice manages live-classroom state only: drawing tool selection, fill colour, recording status, current board index, timer, and the stroke-upload queue (`sendQueueRefList`). It is not used for general app state — everything else is local component state or context.

### Multi-tenancy

`X-Tenant-ID` header is required by most API calls. Currently hardcoded as `"pearl"` in `services/school.ts` (`X_Tenant_ID` export). All service files import this constant — do not inline the value.

### Services Layer

All service files live in `src/services/`. Pattern: a plain object with methods that call the shared `API` instance.

- `services/index.ts` — shared `API`, `TResponse<T>`, `TNullable<T>`, `SchoolInfo` types
- `services/auth.ts` — user auth, token refresh, user CRUD
- `services/school.ts` — classrooms, subjects, teacher assignment
- `services/class-media.ts` — media upload/management for live classes
- `services/user.ts` — user profile updates

### Key Utilities (`src/utils/`)

- `token` — localStorage access/refresh token management
- `localData` — typed localStorage wrapper (`save`, `retrieve`, `remove`)
- `saveActions` — persists live-class recording batches (`currentBatches` key) for replay
- `getDeviceType` — returns `MOBILE | TABLET | DESKTOP` via `react-device-detect`
- `Hashing(password)` — async SHA-256 hash

### @bluethub/ui-kit

Import shared components from `@bluethub/ui-kit` (workspace package at `packages/ui`). Built on shadcn/Radix UI + Tailwind. Exports: `Button`, `Input`, `Dialog`, `Table`, `Calendar`, `Toast` (via sonner), `Dropdown`, `Tabs`, `Tooltip`, `Popover`, `InputOTP`, `AlertDialog`, `Separator`, `RadioGroup`, `Slider`, `ColorPicker`, and others — see `packages/ui/src/index.ts` for the full list.

For local web-app-only components, use `src/component/` (shared across roles) or the per-role subdirectories under `src/pages/`.

### Path Alias

`@/` maps to `apps/web/src/` throughout the web app.

### Live Classroom (Whiteboard)

`/teacher/board` hosts the interactive whiteboard built with `konva` / `react-konva`. Recording batches are compressed and queued via Redux (`sendQueueRefList`) then uploaded in intervals (`SEND_INTERVAL = 10000 ms`). Replay is served at `/replay`.
