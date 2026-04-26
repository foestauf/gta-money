# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Rockstar Trackers" — a single-page Vite + React 19 + TypeScript app that tracks 100% completion progress for Rockstar games. Two games currently live under one shell:

- **GTA V**: a phase-gated money guide (`/gta5`) culminating around $20.8B per character — bespoke UI tied tightly to mission ordering, stock investments, heists, and a Leaflet map of step locations.
- **RDR2**: a hub-and-tracker layout (`/rdr2`) where each completion tracker (Herbs, Horseman challenges, …) is a generic checklist driven by data.

Note: the `README.md` is the leftover Vite template — ignore it. The real project description lives here.

## Commands

Package manager is **pnpm 10.27.0** (pinned via `packageManager` and CI; do not switch to npm/yarn).

```bash
pnpm install            # install deps
pnpm dev                # vite dev server (HMR; React Compiler enabled — slower than vanilla Vite)
pnpm build              # tsc -b && vite build  (typecheck is part of build)
pnpm lint               # eslint .
pnpm preview            # serve the built dist
```

There is no test suite. CI (`.github/workflows/ci.yml`) runs `pnpm lint` and `tsc -b` separately, then on push to `main` builds the Docker image, pushes it to `ghcr.io/foestauf/gta-money:sha-<sha>`, and dispatches an `update-image` event to the `foestauf/homelab-infra` repo for deployment. The container is nginx-unprivileged serving `/dist` on port 8080 with SPA fallback (see `Dockerfile`, `nginx.conf`).

## Architecture

### Routing and shell

`src/main.tsx` → `App.tsx` (`RouterProvider`) → `src/routes.tsx`. The router is a single tree:

```
/                → AppShell (top nav, applies data-game attribute)
  /              → IndexRedirect (sends you to last-visited /gta5 or /rdr2)
  /gta5          → Gta5Page (the whole monolithic guide)
  /rdr2          → Rdr2Layout
    /            → Rdr2Hub (cards: real trackers + stubs)
    /rdr2/herbs  → ChecklistTracker(herbs)
    /rdr2/horses → ChecklistTracker(horses)
  *              → IndexRedirect
```

`AppShell` sets `data-game="gta5" | "rdr2"` on its root div based on the current path. Per-game theming is driven entirely from `src/games/<game>/theme.css` selectors scoped under `[data-game="..."]`. Don't add game-specific styling at the AppShell level — drop it in the game's `theme.css`.

`useLastRoute` (`src/hooks/useLastRoute.ts`) writes the current path to localStorage on every navigation; `IndexRedirect` reads it so reloading `/` returns you to where you were. `useDocumentTitle(parts)` is the single source of truth for tab titles — it appends ` — Rockstar Trackers`. Each top-level route component is responsible for calling it.

### Two progress models — pick the right one

Both persist to localStorage but differ in shape and reach. **Don't mix them.**

- **`useTrackerProgress(trackerId, total)`** in `src/trackers/useTrackerProgress.ts` — a generic checkbox/Set hook. Storage key `tracker:<trackerId>`. Use this for any new RDR2-style checklist where progress is "did I tick this item?".
- **`useGuideProgress`** in `src/hooks/useGuideProgress.ts` — bespoke to the GTA V guide. Knows about `phases`, computes `currentPhaseIndex`, sums `runningMoney` across completed steps, and supports per-phase toggle. Storage key `tracker:gta5:money`. Don't generalize this; it's coupled to the `Step` and `Phase` shapes in `data/guide.ts`.

`main.tsx` deletes the legacy key `gta-money-progress` on every boot — that's an intentional one-time migration left in place; don't remove it without a plan for users who haven't loaded the app since.

### Adding a new RDR2 tracker (the common case)

This is the well-paved path. Four files:

1. **Create** `src/games/rdr2/trackers/<name>.ts` exporting a `TrackerDef` (see `src/trackers/types.ts`). Items group themselves by `category` in the UI; the search box matches across `name`, `description`, `location`, `category`. IDs must be stable — they're the localStorage keys.
2. **Register the route** in `src/routes.tsx`: `{ path: '<name>', element: <ChecklistTracker tracker={<name>} /> }` under the `/rdr2` children.
3. **Promote the card** in `src/games/rdr2/Rdr2Hub.tsx`: move the entry from `stubs` to `real` (or add it).
4. **Add the nav link** in `src/games/rdr2/Rdr2Layout.tsx` (the secondary nav shown only on tracker subpages).

`ChecklistTracker` handles search, grouping, the progress bar, reset confirmation, and document title — you should not need to touch it.

### GTA V guide internals

`src/data/guide.ts` is the canonical dataset (~1300 lines): `phases[].steps[]` with `Step.money`, `investment`, `heist`, `mapIcon`, `character` ('michael' | 'trevor' | 'franklin' | 'any'), etc. `Gta5Page.tsx` is the only consumer; `MapView` is lazy-loaded behind a "Show Map" button so Leaflet doesn't bloat the initial bundle.

The map uses GTA V game-space coordinates transformed via the CRS in `src/data/coordinates.ts` (`gameToLatLng` + `CRS_CONFIG`) — values come from the RiceaRaul/gta-v-map-leaflet community dataset. `stepCoordinates` keys by step ID; `collectibleLocations.ts` holds bulk groups (Nuclear Waste, Briefcases) attached to their step IDs. When adding map points, use the same `(x, y)` game-space convention — don't pre-compute lat/lng.

## TypeScript and lint constraints worth knowing

`tsconfig.app.json` has `verbatimModuleSyntax: true`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`, and `strict`. Practical effects:

- Type-only imports must use `import type { Foo }` — bare `import { Foo }` for a type will fail.
- Unused vars/params fail `tsc -b` (and therefore `pnpm build` and CI).
- No enums, no namespaces, no parameter properties (`erasableSyntaxOnly`).

The **React Compiler** is enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler` (see `vite.config.ts`). Avoid hand-rolled `useMemo`/`useCallback` for plain reactivity — the compiler handles it. Keep them only where they're load-bearing for correctness (stable identity passed to children, expensive computation, etc., as already done in `ChecklistTracker` and `useGuideProgress`).

## Conventions

- React Router imports come from `react-router` (v7), not `react-router-dom`. The `RouterProvider` is imported from `react-router/dom`.
- All progress is client-side localStorage; there is no backend. Treat that as the persistence model — don't reach for IndexedDB or a server unless asked.
- Per-game styles live next to the game (`src/games/<game>/theme.css`). The shared shell styles are `App.css`, `AppShell.css`, `index.css`, and tracker-specific `*.css` next to their components.
- `pnpm-lock.yaml` is committed and CI uses `--frozen-lockfile`. Always commit lockfile changes alongside `package.json`.

## Plans and specs

`docs/superpowers/plans/` and `docs/superpowers/specs/` hold prior-session design notes (e.g. the RDR2 section design). Worth a glance when extending RDR2 — they document intent that isn't otherwise in the code.
