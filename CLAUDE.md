# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**App Qualidade Dados** is a Windows desktop application for healthcare data quality and curation. Built as an Electron shell wrapping a React frontend and an Express backend, both TypeScript.

## Development Commands

All commands use **Bun** as the package manager.

### Root-level (monorepo)
```sh
bun run dev:react        # Start frontend Vite dev server with HMR
bun run dev:backend      # Start backend in watch mode
bun run dev:electron     # Build all + launch Electron app (requires built frontend & backend)
bun run build            # Build electron, react, and backend
bun run dist             # Build + package Windows NSIS installer
```

### Frontend (cd frontend)
```sh
bun run dev      # Vite HMR dev server
bun run build    # tsc + vite build → frontend/dist
bun run lint     # ESLint check
bun run preview  # Preview production build
```

### Backend (cd backend)
```sh
bun run dev      # bun --watch src/server.ts
bun run build    # tsc → backend/dist
bun run start    # node backend/dist/server.js
```

There are no tests configured.

## Architecture

### Three-process model
```
Electron (electron/main.ts)
  ├── spawns → Backend Node process (port 8080)
  └── loads  → frontend/dist/index.html (static)
```

In production, Electron compiles to `dist-electron/main.js` (ESM, via esbuild) and serves the React build as static files. In development, run the frontend and backend dev servers independently; use `bun run dev:react` + `bun run dev:backend` together, then optionally `bun run dev:electron` to test the full Electron shell.

### Frontend (`frontend/src/`)
React 19 SPA with Vite. Key structure:
- `App.tsx` — root component, handles routing/navigation state
- `pages/` — full-page views (VinculoMedico, CuradoriaPacientes)
- `components/ui/` — shadcn/ui primitives (never edit these directly)
- `components/Aside*.tsx` — sidebar navigation
- `config/asideNavigation.ts` — declarative sidebar menu config
- `types/` — TypeScript `.d.ts` interfaces shared across the frontend
- Path alias `@` maps to `./src/` (configured in both `vite.config.ts` and `tsconfig.json`)

UI stack: Tailwind CSS 3 + shadcn/ui (Radix UI primitives) + Sonner for toasts. Dark mode is default via Tailwind's `class` strategy.

### Backend (`backend/src/`)
Express 5 REST API. Layered architecture:
```
router/ → controller/ → service/ → database/
```
- `database/oracleDatabase.ts` — Oracle connection pool (5–20 connections), initialized at startup
- `error/appError.ts` — custom error class; use it for all thrown HTTP errors
- `middleware/errorHandler.ts` — global Express error handler, catches AppError and unhandled errors
- `config/multerConfig.ts` — file upload config for Excel ingestion

### Oracle Database
Connects via TNS alias `MDMFOHML` (resolves to `scan-eqn01.rededor.corp`, service `SERV_PRDINFOS`). Requires Oracle Instant Client 19.x in `resources/instantclient_19_30/` (excluded from git). The `tnsnames.ora` lives in `resources/instantclient_19_30/network/admin/`. The path is provided via the `ORACLE_CLIENT_LIB_DIR` environment variable.

Credentials are currently hardcoded in `backend/src/database/oracleDatabase.ts` — move any new credentials to a `.env` file and load via dotenv (`.env` is gitignored).

## Collaboration Style

- **Teach, don't do**: prefer showing what to change and explaining why over editing files directly. The user wants to learn, not just get the output.
- **Read files proactively**: don't ask the user to paste code. Use the IDE context and open the files yourself to understand what's happening before responding.

## Key Conventions

- **Adding a new page**: create it in `frontend/src/pages/`, then register it in `frontend/src/config/asideNavigation.ts` — this config drives the sidebar automatically.
- **Adding a new API route**: create router → controller → service files, then mount the router in `backend/src/App.ts`.
- **Excel processing**: use the existing `ExcelService` pattern in `backend/src/service/`.
- The frontend calls the backend at `http://localhost:8080` (hardcoded; matches the Electron-spawned backend port).
- Backend TypeScript compiles to CommonJS (`"module": "CommonJS"` in backend tsconfig); frontend uses ESM via Vite.
