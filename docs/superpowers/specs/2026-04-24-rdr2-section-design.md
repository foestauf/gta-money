# RDR2 Section + Multi-Game Tracker Shell

**Date:** 2026-04-24
**Status:** Approved (brainstorming phase)

## Summary

Extend the existing GTA V money guide app into a multi-game tracker hub by introducing a routing shell, per-game theming, and a generic checklist tracker abstraction. Add an RDR2 section with two real trackers (Herbs, Horses for Challenges) and disabled stub cards for planned future trackers (Gold Bars, Treasure Maps, Legendary Animals, Gang Hideouts).

The current GTA V money guide is preserved as-is and lifted unchanged into the new shell.

## Motivation

The user is doing a 100% RDR2 run and wants to track progress for at least herbs and horses needed for the Horseman challenges. The number of trackers is expected to grow, so the shell must make adding a new tracker cheap (ideally just a data file).

## Decisions

The decisions below were made during brainstorming. Each line records the option chosen.

| Decision | Choice |
|---|---|
| RDR2 section first cut | Hub page with stub cards for extensibility |
| Shell / landing UX | Two-level nav (game → tracker), last visit persisted |
| URLs / routing | `react-router` for real, bookmarkable URLs |
| Tracker abstraction | Generic `ChecklistTracker` component for RDR2 trackers; GTA V guide stays bespoke |
| Existing `gta-money-progress` data | Clear and start fresh — old key removed on first load |
| Visual identity per game | Per-game theming via CSS variables (`data-game="..."` attribute); GTA stays gold/dark, RDR2 gets a sepia/leather palette |
| Umbrella brand | "Rockstar Trackers" |
| Initial RDR2 data scope | Real data for Herbs + Horses; disabled stub cards for the rest |
| Tests | No test infra in repo today; not adding any in this pass |

## Architecture

### Routing

```
/                       → redirect to last-visited route, default /gta5
/gta5                   → existing GTA V money guide (single page; no tracker switcher)
/rdr2                   → RDR2 hub: cards for available + stubbed trackers
/rdr2/herbs             → Herbs ChecklistTracker
/rdr2/horses            → Horses ChecklistTracker
*                       → redirect to /
```

`AppShell` is the top-level layout: brand, game switcher, and applies `data-game="gta5"|"rdr2"` to its root element so per-game CSS variables resolve correctly.

GTA V renders directly under `AppShell` at `/gta5`. RDR2 has a sub-layout (`Rdr2Layout`) mounted at `/rdr2` that owns the tracker-level nav (links to herbs/horses + back to hub) and renders the active route via `<Outlet />`. The `/rdr2` index route renders `Rdr2Hub`; `/rdr2/herbs` and `/rdr2/horses` render their respective `ChecklistTracker` instances inside the layout.

### File layout

```
src/
  AppShell.tsx                 top nav, game switcher, data-game attribute, persists last route
  routes.tsx                   react-router config
  games/
    gta5/
      Gta5Page.tsx             extracted from current App.tsx; the existing guide
      theme.css                --gold, --michael, --franklin, --trevor (moved from App.css)
    rdr2/
      Rdr2Layout.tsx           sub-layout for RDR2 (tracker nav)
      Rdr2Hub.tsx              landing cards
      theme.css                sepia/leather palette
      trackers/
        herbs.ts               TrackerDef data
        horses.ts              TrackerDef data
  trackers/
    ChecklistTracker.tsx       generic component
    useTrackerProgress.ts      per-tracker localStorage hook
    types.ts                   ChecklistItem, TrackerDef
  hooks/
    useGuideProgress.ts        unchanged behaviour; storage key rebased to tracker:gta5:money
    useLastRoute.ts            persists last route to localStorage on navigation
  components/
    MapView.tsx                unchanged (GTA-only for now)
  data/                        existing GTA V data (unchanged)
```

`App.tsx` shrinks to mounting the router with `AppShell` as the root layout.

### Generic ChecklistTracker

```ts
type ChecklistItem = {
  id: string;
  name: string;
  description?: string;
  category?: string;     // e.g. "Common Herb", "Tier 1"
  location?: string;     // freeform text; no map coords yet
};

type TrackerDef = {
  id: string;            // "rdr2:herbs"
  game: 'gta5' | 'rdr2';
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
};
```

`<ChecklistTracker tracker={herbs} />` renders:

- Title, optional subtitle, progress bar (`23 / 43 — 53%`)
- Search box: filters items by name, description, and location (case-insensitive substring)
- Items grouped by `category` (collapsible per-category sections); items without a category render in an "Uncategorized" group at the bottom
- Per-item row: checkbox, name, optional description, optional location hint
- "Reset this tracker" button with `confirm()` prompt

State: `useTrackerProgress(tracker.id)` returns `{ done: Set<string>, toggle, reset, count, total }`. It mirrors the toggle/reset semantics of the existing `useGuideProgress` but is keyed per tracker id.

### Storage

| Key | Value |
|---|---|
| `tracker:gta5:money` | JSON-serialised array of completed step IDs (replaces old key) |
| `tracker:rdr2:herbs` | JSON-serialised array of completed item IDs |
| `tracker:rdr2:horses` | JSON-serialised array of completed item IDs |
| `app:lastRoute` | string — last navigated pathname |

On first load: `localStorage.removeItem('gta-money-progress')` runs once (idempotent — `removeItem` on a missing key is a no-op). No migration; clean break by user request.

`useGuideProgress` reads/writes `tracker:gta5:money` instead of `gta-money-progress`. Otherwise unchanged.

### Theming

`AppShell` sets `data-game="gta5"` or `data-game="rdr2"` on its root element based on the current route. CSS variables defined under `[data-game="gta5"]` and `[data-game="rdr2"]` selectors override the defaults. Existing `--gold`, `--michael`, `--franklin`, `--trevor` variables move into the GTA-scoped block. RDR2 gets its own palette (sepia background, parchment surface, deep red accent, cream text) defined in `games/rdr2/theme.css`.

The umbrella brand displayed in `AppShell` is "Rockstar Trackers". Document `<title>` updates per route (e.g. "Herbs — RDR2 — Rockstar Trackers").

### Last-route persistence

`useLastRoute()` listens to react-router location changes and writes `location.pathname` to `app:lastRoute`. The `/` route reads it and redirects (or falls back to `/gta5` if absent or invalid).

## Initial RDR2 data scope

### Herbs
All 43 named herbs from RDR2 base game, each with:
- `id`: kebab-case slug (e.g. `yarrow`)
- `name`: in-game display name
- `category`: biome / region grouping (e.g. "Heartlands", "Grizzlies", "Bayou")
- `location`: 1-line text hint for where it grows
- `description` (optional): notable use, e.g. "Crafted into Special Health Tonic"

No coordinates / map for this pass.

### Horses for Challenges
Items keyed to the Horseman challenge requirements (9 challenges). Each item is a discrete required action, e.g. "Break and hitch a wild horse", "Ride from Valentine to Rhodes without dying", along with the breed-specific items (specific named/wild horses required for individual challenges).
- `category`: `"Horseman 1"` … `"Horseman 9"`
- `location` (optional): where the relevant horse spawns or task takes place
- `description`: the exact task text

### Stub cards (on `/rdr2`)
Disabled, no route, render as visually-greyed cards labelled "Coming soon":
- Gold Bars
- Treasure Maps
- Legendary Animals
- Gang Hideouts

## Out of scope for this pass

- RDR2 map view (Leaflet integration for herbs / horses coordinates)
- Cross-tracker stats / overall completion %
- Importing or exporting progress
- Adding a third game
- Mobile-specific layout work (existing responsive behaviour is preserved)
- Adding test infrastructure

## Verification

The repo has no test infra today. Verification for this work:

- `pnpm build` runs clean (TypeScript + Vite production build)
- `pnpm lint` passes
- Manual smoke:
  - Visit `/`, get redirected to `/gta5`; complete a step, refresh, progress persists
  - Visit `/rdr2`, see hub with two enabled cards + four disabled stubs
  - Click Herbs, tick an item, refresh, persistence holds
  - Switch to GTA V via the game switcher, theme swaps (gold/dark)
  - Switch to RDR2, theme swaps (sepia/leather)
  - Refresh on `/rdr2/horses`, lands directly on that page (router works)
  - Visit `/`, get redirected to `/rdr2/horses` (last-route persisted)
  - Old `gta-money-progress` key absent from localStorage after first load

## Open follow-ups (not part of this spec)

- A future spec can add an RDR2 map view + per-item coordinates for herbs / animals
- A future spec can flesh out each stub card (Gold Bars, etc.) with real data
- If a fourth+ tracker reveals a pattern not covered by `ChecklistTracker` (e.g. nested progress, conditional unlocks), revisit the abstraction then — not now.
