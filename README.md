# World Connector — "The Spatial Connector of Worlds"

A spatial hub that presents a curated collection of independent websites
("worlds") as floating cards you can explore and launch into.

This repo contains the deployable World Connector hub: a calm, spatial
collection of independent websites presented as floating worlds.

### Phase 1 — Foundation

- [x] Monorepo scaffold: `frontend/` (React + TS + Vite + Tailwind) and
      `backend/` (Express + TS + Prisma + PostgreSQL).
- [x] `World` database schema (generic — no per-website logic).
- [x] Backend API: `GET /api/worlds` (public, active-only, ordered) and a
      protected `/api/admin/worlds` CRUD surface, guarded by Supabase Auth.
- [x] Supabase Auth verification middleware + Supabase Storage upload
      helper for artwork.
- [x] Seed script that creates AFTERSHOW and ANTEIKU exactly as specified
      (FRAME intentionally **not** seeded yet).
- [x] Frontend talks to the backend (`useWorlds` hook).

### Phase 2 — Spatial visual prototype

- [x] Full-screen immersive environment (`pages/Home.tsx` +
      `components/atmosphere/AmbientBackground.tsx`) — no navbar, sidebar,
      hero banner, or dashboard grid.
- [x] Dynamic 3D spatial arrangement (`geometry/spatialLayout.ts` +
      `components/spatial/SpatialStage.tsx`): position, scale, rotation,
      depth (z), and opacity are all *calculated* from a card's distance
      from the focused one — nothing is hardcoded per-website, and the
      math works the same whether there are 2 worlds or 50.
- [x] Horizontal arrangement on desktop, vertical on mobile
      (`hooks/useViewportOrientation.ts`), switching live on resize.
- [x] Floating glass cards with real artwork or an elegant temporary
      placeholder (`components/spatial/SpatialWorldCard.tsx`,
      `ArtworkPlaceholder.tsx`) — the focused card is larger and sharper,
      others recede via scale/depth/rotation/opacity.
- [x] Translucent, visionOS-inspired bottom dock
      (`components/spatial/SpatialDock.tsx`), always in sync with the
      focused card via one shared `focusedIndex` — no competing
      navigation state.
- [x] Quiet side navigation controls (`NavigationControls.tsx`), oriented
      left/right on desktop and up/down on mobile.
- [x] Keyboard navigation (arrow keys) and `prefers-reduced-motion`
      support (`usePrefersReducedMotion.ts`).

Selecting the focused card enters its registered destination after a short
spatial transition. Selecting a neighboring card focuses it first; selecting
it again enters it. The dock and navigation controls remain focus-only.

### Phase 3 — Interaction physics

- [x] A continuous rotation model (`hooks/useSpatialRotation.ts`):
      focus position is a float, not just a whole index, so motion is
      fluid rather than a discrete snap-based carousel.
- [x] Drag/swipe via Pointer Events (`hooks/useDragInteraction.ts`) —
      mouse, touch, and trackpad all go through the same path, with
      1:1 tracking while the gesture is live.
- [x] Velocity-aware release: a gentle drag barely moves things, a
      normal swipe glides to a neighbor, a strong swipe carries momentum
      through several worlds before friction brings it down
      (`physics/inertia.ts`).
- [x] A damped spring settles the arrangement onto the nearest world
      once velocity decays (`physics/settling.ts`) — the exact same
      spring is used for dock clicks, side-arrow presses, and keyboard
      steps, so every navigation method feels like the same physical
      object.
- [x] Soft rubber-band resistance when dragging past the first or last
      world, instead of a rigid stop.
- [x] `prefers-reduced-motion` now actually changes the physics (fast,
      direct, no momentum carry-through) rather than just toggling a
      transition duration.

### Completed product features

- [x] World-entry transition with configurable same-tab/new-tab navigation.
- [x] Protected `/admin` UI with Supabase login, CRUD, enable/disable,
      ordering, artwork upload/preview, and registry refresh.
- [x] Vercel configuration for the Vite frontend and Express/Prisma API.

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local, Docker, Supabase Postgres, Neon, etc.)
- A Supabase project (for Auth + Storage)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET, ADMIN_EMAILS
npm install
npx prisma migrate dev --name init
npm run seed      # creates AFTERSHOW + ANTEIKU
npm run dev        # starts the API on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:4000
npm install
npm run dev         # starts the app on http://localhost:5173
```

Open `http://localhost:5173` — you should see the spatial environment:
AFTERSHOW and ANTEIKU floating as glass cards with placeholder artwork,
arranged horizontally (or vertically on a narrow/mobile viewport), with
a translucent dock at the bottom and quiet side arrows. Try dragging
the cards directly (mouse or touch) — a light drag nudges things, a
firm swipe carries momentum and glides to a stop; or use a dock
thumbnail, the side arrows, or arrow keys, which all settle with the
same spring. That confirms: DB ✅, API ✅, Auth wiring ✅,
frontend↔backend plumbing ✅, spatial rendering ✅, interaction
physics ✅.

The admin panel is at `http://localhost:5173/admin`.

## Deploy to Vercel

Deploy this as two Vercel projects because the frontend is a static Vite
site while the API needs a Prisma-backed serverless function.

1. Import the repository as the frontend project. Keep the root directory
   as `.`; the root `vercel.json` builds `frontend/` and serves its `dist`.
   Add `VITE_API_BASE_URL=https://<your-api-project>.vercel.app`,
   `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
2. Create a second Vercel project pointing at the same repository with root
   directory `backend`. Its `backend/vercel.json` exposes `/api/index.ts`.
   Add `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SUPABASE_ARTWORK_BUCKET`, `ADMIN_EMAILS`, and `CORS_ORIGIN`.
3. Run `npx prisma migrate deploy` against the production database, then
   run `npm run seed` once from `backend/` with the production
   `DATABASE_URL`. Create the `world-artwork` Supabase Storage bucket as a
   public bucket.

## Project structure

```
world-connector/
├── frontend/   # React + TS + Vite + Tailwind
└── backend/    # Express + TS + Prisma + PostgreSQL
```
