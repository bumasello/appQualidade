# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**App Qualidade Dados** is a Windows desktop app for healthcare data quality and curation at Rede D'Or. Electron shell wrapping a React frontend and an Express backend, both TypeScript. UI text, comments, and commit messages are in Portuguese — match that.

## Collaboration Style

- **Teach, don't do**: prefer showing what to change and explaining why over editing files directly. The user wants to learn, not just get the output.
- **Read files proactively**: don't ask the user to paste code. Open the files yourself before responding.

## Development Commands

Package manager is **Bun**. There are no tests configured (`backend`'s `test` script is a stub).

```sh
bun run dev:react        # Vite HMR dev server (frontend only)
bun run dev:backend      # bun --watch on backend/src/server.ts
bun run dev:electron     # build all three, then launch Electron — the only way to exercise the real app
bun run build            # build:electron + build:react + build:backend
bun run dist:hml         # build + package + publish HML pre-release to GitHub
bun run dist:prd         # build + package + publish PRD release to GitHub
cd frontend && bun run lint   # ESLint (frontend only; backend has no linter)
```

`dev:react` alone gives HMR but no Oracle data — the frontend hardcodes `http://localhost:8080`, so `dev:backend` must run alongside it. `dev:electron` is a full rebuild every time (no HMR); use it to validate before pushing to HML, as `RELEASING.md` requires.

## Build Pipeline (three different compilers)

| Target   | Tool                        | Output                       |
| -------- | --------------------------- | ---------------------------- |
| electron | esbuild → **CJS**           | `dist-electron/main.cjs`     |
| frontend | `tsc -b` + vite             | `frontend/dist/`             |
| backend  | esbuild bundle, `--external:oracledb` | `backend/dist/server.js` |

The root `package.json` is `"type": "module"`, which is why the Electron entry is bundled to `.cjs`. The backend ships as a **single esbuild bundle**, not a `tsc` tree — `backend/package.json`'s own `build`/`start` scripts (tsc → `dist/src/server.js`) are legacy and not what gets packaged. `oracledb` stays external because it loads native binaries; electron-builder copies `backend/node_modules/oracledb` into `app.asar.unpacked` via `extraResources`.

## Runtime Architecture

```
Electron main (dist-electron/main.cjs)
  ├── utilityProcess.fork → backend/dist/server.js  (port 8080)
  └── loadFile           → frontend/dist/index.html (static, nodeIntegration on)
```

The backend is an Electron `utilityProcess`, not a plain `child_process` — that's what keeps a console window from flashing on Windows. Main passes `PORT`, `ORACLE_CLIENT_LIB_DIR`, and `LOG_FILE` into its env, and pipes all stdout/stderr into `<userData>/backend.log`. A nonzero backend exit pops a `dialog.showErrorBox` with the captured output — that log is the first place to look when a packaged build won't start.

`backend/src/oracledb-preload.ts` is imported first in `server.ts` purely to install `uncaughtException`/`unhandledRejection` handlers that write to `LOG_FILE` before exiting, since a crashed utility process leaves no visible trace otherwise.

Auto-update (`electron-updater`) runs only when `app.isPackaged`, with `autoDownload = false` and user-confirmation dialogs.

## Environment & Secrets

Nothing is hardcoded anymore — `server.ts` fails fast at startup against a `REQUIRED_ENV` list before opening any pool. Where the env comes from:

- **Dev**: `backend/.env` (loaded by `server.ts`); Electron dev additionally reads `.env.${APP_ENV ?? "prd"}` at the repo root.
- **Packaged**: electron-builder copies `.env.prd` (or `.env.hml`) to `resources/.env.app`; main loads it from `process.resourcesPath`.

All of `.env.prd`, `.env.hml`, `backend/.env`, and `resources/` are gitignored — `.env.example` is the only committed template. Note it is currently **missing** `MDM_TBL_AUDITORIA`, `MDM_SEQ_AUDITORIA`, `SMTP_HOST`, and `SMTP_PORT`, all of which the code reads; add new vars there when you introduce them.

Oracle Instant Client 19.x must sit in `resources/instantclient_19_30/` (gitignored, shipped as `extraResources`). Its path reaches the backend as `ORACLE_CLIENT_LIB_DIR`.

## Backend (`backend/src/`)

Express 5, layered `router/ → controller/ → service/ → database/`.

**Two independent Oracle pools**, each a static-class singleton with an identical shape (`initPool` / `getConnection` / `testConnection`, pool 5–20, increment 5), both created in `server.ts` before `app.listen()`:

- `database/mdm_database.ts` + `service/mdm.service.ts` — MDM: users, professional registry, audit trail. `MDMService` exposes `query` / `update` / `insert`.
- `database/qld_database.ts` + `service/qld.service.ts` — QLD: doctor/oncology curation tables. `QLDService` exposes `query` / `update` only.

Both service wrappers own the connection lifecycle: `autoCommit: false`, explicit `commit()`/`rollback()`, `close()` in `finally`, and an optional `expected_rows` guard that throws `AppError` when the affected-row count doesn't match. **Always go through these wrappers** — never call `getConnection()` from a domain service.

SQL convention: **table and sequence names are interpolated from env vars** (`INSERT INTO ${process.env.MDM_TBL_AUDITORIA}`) because they differ between PRD and HML; **all values are bind parameters** (`:usuarioId`). Keep that split — identifiers interpolated, values bound.

Other backend conventions:

- Throw `AppError(message, statusCode)` for anything the client should see; `middleware/errorHandler.ts` is the only place that formats responses (`{ success, message }`). Unrecognized errors become a generic 500.
- Controllers are **arrow-function class properties** (so `this` survives Express routing) wrapping the whole body in `try/catch` → `next(error)`. Async throws will not reach the handler otherwise.
- `middleware/isAuth.ts` verifies the JWT and attaches `user_id` / `user_name` to the request; downstream code casts to the exported `ReqUser` interface. Every router except `user.router.ts` (login / signup / password reset) is behind it.
- `service/audit.service.ts` — call `AuditService.registrar({...})` after any mutation that changes curated data; it records actor, action, table, payload, and prior state.
- Excel ingestion goes through `config/multerConfig.ts` (memory storage, `.xls`/`.xlsx` mimetype filter) and then `service/excel.service.ts`.

**Adding a route**: create router → controller → service, then mount the router in `App.ts` `initRoute()`. Current mounts: `/prf_saude`, `/user`, `/utilitarios`.

## Frontend (`frontend/src/`)

React 19 SPA, Vite, Tailwind 3 + shadcn/ui (Radix), Sonner toasts, dark-only. `@` → `./src/`. `__APP_VERSION__` is injected by `vite.config.ts` from the **root** package.json version.

**There is no router.** `App.tsx` holds a `selectedAutomation` state of union type `AutomationKey` and renders via a `switch`. Adding a page means three coordinated edits:

1. Create the page under `pages/<domain>/`.
2. Add its key to the `AutomationKey` union **and** a `case` in `renderMainContent()` — both in `App.tsx`.
3. Add a `SubItem` to the right array in `config/asideNavigation.ts`.

Note the sidebar is only *half* config-driven: `asideNavigation.ts` supplies the sub-items, but the top-level groups (icon, label, accordion key) are hardcoded as `<AsideListItem>` elements in `components/Aside.tsx`. A new top-level group needs an edit there too. (`pacienteSubItems` is exported but its group is currently commented out.)

`contexts/AuthContext.tsx` keeps the JWT in React state only — no localStorage, so a reload logs the user out; `App.tsx` starts on `"login"` and flips to `"home"` on success. Pages read `auth.token` via `useAuth()` and send `Authorization: Bearer ${token}` on every fetch.

API calls are bare `fetch` with the URL hardcoded to `http://localhost:8080/...` (matching the Electron-spawned backend). There is no API client module; follow the existing per-page pattern.

`components/ui/` is generated shadcn — don't hand-edit.

## Releasing

`RELEASING.md` is authoritative and detailed; the essentials:

- Branches: `master` = PRD source, `hml` = staging, `dev-*` = feature work. Merge `dev-* → master` directly; **never merge `hml` into `master`**.
- Conventional Commits (`feat(backend): ...`, `fix(electron): ...`) drive the version bump choice.
- HML: bump with `npm version prerelease --preid=beta`, then `bun run dist:hml` (publishes a GitHub pre-release on the `beta` channel).
- PRD: `npm version patch|minor|major`, then `bun run dist:prd`. Push commits **and** tags before publishing.
- A version bump only happens when new work is entering HML; a plain `master → hml` infra sync does not bump.
