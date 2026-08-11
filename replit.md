# Coverline OS MGA — Admin Panel

A Lovable-built admin dashboard for an insurance Managing General Agent (MGA) platform.

## Stack

- **TanStack Start** (SSR framework)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **TanStack Router** (file-based routing)
- **Vite 8** with `@lovable.dev/vite-tanstack-config`

## Running on Replit

```sh
npm run dev
```

The dev server starts on **port 8080** (forced by `@lovable.dev/vite-tanstack-config`). The workflow is named **"Start application"** and is configured to wait on port 8080.

## App routes

| Route | Description |
|---|---|
| `/` | Admin overview — tenant info, connector health, recent activity |
| `/users` | User management (invite, edit roles) |
| `/settings` | Platform settings (premium cap, thresholds, etc.) |
| `/integrations` | Connector health (Guidewire, Verisk, DocuSign, etc.) |
| `/audit` | Full activity log, filterable by workflow and actor type |

## Data layer

Currently uses **local in-memory demo data** (`src/lib/admin-api.ts`). The API shape is designed to be swapped for real `fetch()` calls against `VITE_CORE_API_BASE_URL` when a backend is available.

## Replit-specific notes

- `vite.config.ts` sets `server.host = "0.0.0.0"` and `allowedHosts: true` so the Replit proxy can reach the dev server.
- The Lovable config enforces port 8080 and ignores custom port settings.

## User preferences

_(none yet)_
