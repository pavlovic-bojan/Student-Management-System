# SMS Frontend

Vue 3 + Quasar + Pinia + TypeScript frontend for Student Management System.

## Setup

1. From repo root: `npm install`
2. Copy `project-doc/logo.png` to `frontend/public/logo.png` so the app logo displays.
3. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` (e.g. `http://localhost:4000/api`).

## Scripts

- `npm run dev` – start dev server (Vite)
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run test` – run unit/component tests

## Structure

- **Drawer**: Left drawer for navigation; right drawer for “Submit report” form (no popups).
- **i18n**: English (en), Serbian Latin (sr-lat), Serbian Cyrillic (sr-cyr).
- **API**: `src/api/` – axios client and endpoint modules.
- **Stores**: Pinia – `stores/ui.ts` for drawer state.
