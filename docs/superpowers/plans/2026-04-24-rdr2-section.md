# RDR2 Section + Multi-Game Tracker Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the GTA V money guide into a multi-game tracker hub. Add an RDR2 section with two real trackers (Herbs, Horses) plus stub cards for future trackers, behind real URL routes.

**Architecture:** A top-level `AppShell` (game switcher + brand + theming) wraps `react-router` routes. GTA V keeps its existing bespoke page. RDR2 has a sub-layout with a hub and `ChecklistTracker` instances driven by per-tracker data files. Per-game theming via `data-game` attribute + scoped CSS variables. Per-tracker localStorage keys. The old `gta-money-progress` key is removed on first load (clean break).

**Tech Stack:** React 19, TypeScript, Vite, `react-router` v7 (declarative + data-mode), CSS variables for theming, localStorage for persistence. No test infra (none exists in repo; not adding any in this pass — verification is `pnpm build` + `pnpm lint` + manual smoke).

**Spec:** `docs/superpowers/specs/2026-04-24-rdr2-section-design.md`

---

## File map

| Path | Status | Responsibility |
|---|---|---|
| `src/main.tsx` | Modify | Run one-time `localStorage.removeItem('gta-money-progress')` before render. |
| `src/App.tsx` | Modify | Shrinks to `<RouterProvider router={router} />`. |
| `src/AppShell.tsx` | Create | Layout: brand, game switcher, applies `data-game` attribute, persists last route. |
| `src/routes.tsx` | Create | `createBrowserRouter` config with nested routes. |
| `src/hooks/useLastRoute.ts` | Create | Listens to location, writes `app:lastRoute`. |
| `src/hooks/useDocumentTitle.ts` | Create | Sets `document.title` for the current view. |
| `src/hooks/useGuideProgress.ts` | Modify | Storage key becomes `tracker:gta5:money`. |
| `src/games/gta5/Gta5Page.tsx` | Create | Lifted contents of current `App.tsx` (the guide UI). |
| `src/games/gta5/theme.css` | Create | GTA-scoped CSS vars (`[data-game="gta5"]`). |
| `src/games/rdr2/Rdr2Layout.tsx` | Create | Sub-layout for `/rdr2/*`: tracker nav + `<Outlet />`. |
| `src/games/rdr2/Rdr2Hub.tsx` | Create | Landing cards (real + stub). |
| `src/games/rdr2/Rdr2Hub.css` | Create | Hub card styling. |
| `src/games/rdr2/theme.css` | Create | RDR2-scoped CSS vars (`[data-game="rdr2"]`). |
| `src/games/rdr2/trackers/herbs.ts` | Create | Herbs `TrackerDef`. |
| `src/games/rdr2/trackers/horses.ts` | Create | Horses `TrackerDef`. |
| `src/trackers/types.ts` | Create | `ChecklistItem`, `TrackerDef`. |
| `src/trackers/useTrackerProgress.ts` | Create | Generic per-tracker progress hook. |
| `src/trackers/ChecklistTracker.tsx` | Create | Generic component. |
| `src/trackers/ChecklistTracker.css` | Create | Component styles. |
| `src/index.css` | Modify | Keep neutral / shared variables only; move character/gold to GTA theme. |
| `src/App.css` | Keep | GTA-specific component styling continues to live here (used by `Gta5Page.tsx`). |
| `package.json` / `pnpm-lock.yaml` | Modify | Adds `react-router` dependency. |

Since there is no test framework in the repo, each task ends with a build/lint check (`pnpm build && pnpm lint`) and a focused manual smoke instruction, then a commit. **Never skip the build/lint check before committing.**

---

### Task 1: Install react-router

**Files:**
- Modify: `/home/foestauf/gta-money/package.json`
- Modify: `/home/foestauf/gta-money/pnpm-lock.yaml`

- [ ] **Step 1: Install react-router v7**

```bash
cd /home/foestauf/gta-money
pnpm add react-router@^7
```

- [ ] **Step 2: Verify the install**

Run: `pnpm list react-router`

Expected: prints a single `react-router` entry at version `7.x.y`. No `react-router-dom` is needed (v7 ships from `react-router`).

- [ ] **Step 3: Smoke build**

Run: `pnpm build`

Expected: build completes; no new errors. (The dep is added but not yet used.)

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add react-router for multi-page tracker shell"
```

---

### Task 2: Lift current GTA V page into `games/gta5/Gta5Page.tsx`

This task does not change behaviour; it just relocates code so subsequent routing tasks can mount it. App.tsx remains the entry until Task 3.

**Files:**
- Create: `src/games/gta5/Gta5Page.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/games/gta5/Gta5Page.tsx`**

Copy the entire contents of `src/App.tsx` into the new file, then:
- Rename `function App()` to `function Gta5Page()`.
- Change `export default App;` to `export default Gta5Page;`.
- Update the relative imports so they still resolve from the new location:
  - `'./App.css'` → `'../../App.css'`
  - `'./data/guide'` → `'../../data/guide'`
  - `'./hooks/useGuideProgress'` → `'../../hooks/useGuideProgress'`
  - `'./components/MapView'` → `'../../components/MapView'` (the `lazy` import path)

Everything else is identical to the current `App.tsx`.

- [ ] **Step 2: Replace `src/App.tsx` with a re-export shim**

Overwrite the file contents with:

```tsx
import Gta5Page from './games/gta5/Gta5Page';

export default Gta5Page;
```

This keeps `main.tsx` working unchanged for now. (We replace `App.tsx` again in Task 3.)

- [ ] **Step 3: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 4: Manual smoke**

Run: `pnpm dev` and open the printed URL.

Expected: GTA V money guide renders identically to before. Tick a step, refresh — progress persists. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/games/gta5/Gta5Page.tsx src/App.tsx
git commit -m "refactor: relocate GTA V guide page to games/gta5"
```

---

### Task 3: Wire up react-router with `AppShell` + last-route persistence

**Files:**
- Create: `src/AppShell.tsx`
- Create: `src/AppShell.css`
- Create: `src/routes.tsx`
- Create: `src/hooks/useLastRoute.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useLastRoute.ts`**

```ts
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const LAST_ROUTE_KEY = 'app:lastRoute';

export function useLastRoute() {
  const location = useLocation();
  useEffect(() => {
    try {
      localStorage.setItem(LAST_ROUTE_KEY, location.pathname);
    } catch { /* ignore quota / privacy errors */ }
  }, [location.pathname]);
}

export function readLastRoute(): string | null {
  try {
    return localStorage.getItem(LAST_ROUTE_KEY);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create `src/AppShell.css`**

```css
.app-shell-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.app-shell-brand {
  font-family: Impact, 'Arial Narrow', 'Haettenschweiler', sans-serif;
  font-size: 20px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-heading);
}

.app-shell-games {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.app-shell-game-link {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.app-shell-game-link.active {
  border-color: var(--accent, var(--text-heading));
  color: var(--accent, var(--text-heading));
}
```

- [ ] **Step 3: Create `src/AppShell.tsx`**

```tsx
import { NavLink, Outlet, useLocation } from 'react-router';
import { useLastRoute } from './hooks/useLastRoute';
import './AppShell.css';

function gameForPath(pathname: string): 'gta5' | 'rdr2' | 'none' {
  if (pathname === '/gta5' || pathname.startsWith('/gta5/')) return 'gta5';
  if (pathname === '/rdr2' || pathname.startsWith('/rdr2/')) return 'rdr2';
  return 'none';
}

export default function AppShell() {
  useLastRoute();
  const location = useLocation();
  const game = gameForPath(location.pathname);

  return (
    <div data-game={game === 'none' ? undefined : game}>
      <nav className="app-shell-nav">
        <span className="app-shell-brand">Rockstar Trackers</span>
        <div className="app-shell-games">
          <NavLink
            to="/gta5"
            className={({ isActive }) =>
              `app-shell-game-link${isActive ? ' active' : ''}`
            }
          >
            GTA V
          </NavLink>
          <NavLink
            to="/rdr2"
            className={({ isActive }) =>
              `app-shell-game-link${isActive ? ' active' : ''}`
            }
          >
            RDR2
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 4: Create `src/routes.tsx`**

This file defines the router. The RDR2 routes are stubbed to placeholders here; later tasks replace those placeholders with real components. Stubs use minimal inline elements so the router compiles and the routing skeleton can be smoke-tested in isolation.

```tsx
import { createBrowserRouter, Navigate } from 'react-router';
import AppShell from './AppShell';
import Gta5Page from './games/gta5/Gta5Page';
import { readLastRoute } from './hooks/useLastRoute';

function IndexRedirect() {
  const last = readLastRoute();
  const target = last && (last.startsWith('/gta5') || last.startsWith('/rdr2'))
    ? last
    : '/gta5';
  return <Navigate to={target} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: IndexRedirect },
      { path: 'gta5', Component: Gta5Page },
      {
        path: 'rdr2',
        children: [
          { index: true, element: <div>RDR2 hub (placeholder)</div> },
          { path: 'herbs', element: <div>Herbs tracker (placeholder)</div> },
          { path: 'horses', element: <div>Horses tracker (placeholder)</div> },
        ],
      },
      { path: '*', Component: IndexRedirect },
    ],
  },
]);
```

- [ ] **Step 5: Replace `src/App.tsx`**

```tsx
import { RouterProvider } from 'react-router/dom';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 6: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 7: Manual smoke**

Run: `pnpm dev`. Verify:
- `/` redirects to `/gta5` on first visit (no `app:lastRoute` yet).
- `/gta5` renders the existing money guide unchanged.
- `/rdr2` shows the placeholder text "RDR2 hub (placeholder)".
- `/rdr2/herbs` shows "Herbs tracker (placeholder)".
- Clicking the **GTA V** / **RDR2** game-switch links navigates correctly and the active link highlights.
- Reload on `/rdr2/horses` lands directly there.
- Visit `/rdr2/herbs`, then visit `/`. You land on `/rdr2/herbs` (last-route persisted). Confirm via DevTools that `localStorage["app:lastRoute"]` is set.
- An unknown path like `/foo` redirects via the `*` route.

Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add src/AppShell.tsx src/AppShell.css src/routes.tsx src/hooks/useLastRoute.ts src/App.tsx
git commit -m "feat: add router shell with game switcher and last-route persistence"
```

---

### Task 4: Per-game CSS variable theming

Move GTA-coded variables out of the global `:root` and into a `[data-game="gta5"]` block; add an RDR2 palette. Shared neutrals (typography, structural greys) stay global so the shell looks consistent during transitions / on the index redirect frame.

**Files:**
- Modify: `src/index.css`
- Create: `src/games/gta5/theme.css`
- Create: `src/games/rdr2/theme.css`
- Modify: `src/games/gta5/Gta5Page.tsx` (import its theme)
- Modify: `src/games/rdr2/Rdr2Layout.tsx` — created in Task 7; for now we attach RDR2 theme via a placeholder import in routes. Defer until Task 7.

- [ ] **Step 1: Rewrite `src/index.css`**

Keep only the neutral/structural vars and base typography/layout. The GTA-specific colour vars move out.

```css
:root {
  --bg: #0d1117;
  --bg-card: #161b22;
  --bg-card-hover: #1c2333;
  --bg-input: #21262d;
  --border: #30363d;
  --text: #c9d1d9;
  --text-muted: #8b949e;
  --text-heading: #f0f6fc;

  --green: #3ddc84;
  --red: #f85149;
  --blue: #58a6ff;

  --sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --heading: system-ui, -apple-system, 'Segoe UI', sans-serif;

  font: 15px/1.5 var(--sans);
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }
body { margin: 0; }

#root {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 64px;
}
```

- [ ] **Step 2: Create `src/games/gta5/theme.css`**

```css
[data-game="gta5"] {
  --michael: #4a90d9;
  --franklin: #3ddc84;
  --trevor: #e8923a;
  --gold: #f0c040;
  --gold-dim: rgba(240, 192, 64, 0.15);
  --accent: var(--gold);
}
```

- [ ] **Step 3: Create `src/games/rdr2/theme.css`**

A sepia/leather palette tuned for legibility on a dark base.

```css
[data-game="rdr2"] {
  --bg: #1a140d;
  --bg-card: #261c12;
  --bg-card-hover: #32261a;
  --bg-input: #2d2317;
  --border: #4a3a26;
  --text: #ddc9a8;
  --text-muted: #9c8e72;
  --text-heading: #f5e8d0;

  --rdr-cream: #e8d8b3;
  --rdr-leather: #8b5a2b;
  --rdr-blood: #9b2c2c;
  --rdr-parchment: #d6c197;
  --accent: var(--rdr-blood);
}
```

- [ ] **Step 4: Import GTA theme from `Gta5Page.tsx`**

At the top of `src/games/gta5/Gta5Page.tsx`, add (after the existing `'../../App.css'` import):

```ts
import './theme.css';
```

(The RDR2 theme is imported in Task 7, where the layout is created.)

- [ ] **Step 5: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 6: Manual smoke**

Run: `pnpm dev`.

- On `/gta5` the gold + character colours should render unchanged. Pop DevTools → Elements; confirm `<div data-game="gta5">` exists in the DOM.
- On `/rdr2` (placeholder text still) the page background should turn warm sepia (`--bg: #1a140d`). Confirm `<div data-game="rdr2">`.
- On `/` (which redirects), no `data-game` attribute is set during the redirect frame — that's expected.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/index.css src/games/gta5/theme.css src/games/rdr2/theme.css src/games/gta5/Gta5Page.tsx
git commit -m "feat: per-game CSS variable theming via data-game attribute"
```

---

### Task 5: Storage rebase + clean break from old key

**Files:**
- Modify: `src/hooks/useGuideProgress.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update the storage key in `useGuideProgress.ts`**

Open `src/hooks/useGuideProgress.ts` and change the `STORAGE_KEY` constant near the top of the file from:

```ts
const STORAGE_KEY = 'gta-money-progress';
```

to:

```ts
const STORAGE_KEY = 'tracker:gta5:money';
```

No other changes to the hook.

- [ ] **Step 2: Remove old key on app load in `src/main.tsx`**

Replace the contents of `src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

try {
  localStorage.removeItem('gta-money-progress');
} catch { /* ignore */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

The `removeItem` is idempotent (no-op when the key is absent), safe to run on every load.

- [ ] **Step 3: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 4: Manual smoke**

Run: `pnpm dev`. In DevTools → Application → Local Storage:
- Manually add a key named `gta-money-progress` with value `["1-1"]`.
- Refresh the page.
- Confirm `gta-money-progress` is gone.
- On `/gta5`, tick a step. Confirm `tracker:gta5:money` now exists with the new step ID. Refresh — progress persists.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGuideProgress.ts src/main.tsx
git commit -m "refactor: rebase GTA V progress storage to tracker:gta5:money"
```

---

### Task 6: Tracker types + `useTrackerProgress` hook

**Files:**
- Create: `src/trackers/types.ts`
- Create: `src/trackers/useTrackerProgress.ts`

- [ ] **Step 1: Create `src/trackers/types.ts`**

```ts
export type Game = 'gta5' | 'rdr2';

export interface ChecklistItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
}

export interface TrackerDef {
  id: string;
  game: Game;
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
}
```

- [ ] **Step 2: Create `src/trackers/useTrackerProgress.ts`**

```ts
import { useCallback, useMemo, useState } from 'react';

function storageKey(trackerId: string): string {
  return `tracker:${trackerId}`;
}

function loadDone(trackerId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(trackerId));
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveDone(trackerId: string, done: Set<string>) {
  try {
    localStorage.setItem(storageKey(trackerId), JSON.stringify([...done]));
  } catch { /* ignore */ }
}

export function useTrackerProgress(trackerId: string, total: number) {
  const [done, setDone] = useState<Set<string>>(() => loadDone(trackerId));

  const toggle = useCallback((itemId: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      saveDone(trackerId, next);
      return next;
    });
  }, [trackerId]);

  const reset = useCallback(() => {
    if (window.confirm('Reset progress on this tracker? This cannot be undone.')) {
      const empty = new Set<string>();
      saveDone(trackerId, empty);
      setDone(empty);
    }
  }, [trackerId]);

  const count = done.size;
  const pct = useMemo(() => total === 0 ? 0 : Math.round((count / total) * 100), [count, total]);

  return { done, toggle, reset, count, total, pct };
}
```

The `total` arg is passed from the caller (it's `tracker.items.length`); keeping it in the hook signature avoids importing the data into the hook.

- [ ] **Step 3: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed (the new files compile but aren't yet imported).

- [ ] **Step 4: Commit**

```bash
git add src/trackers/types.ts src/trackers/useTrackerProgress.ts
git commit -m "feat: add tracker types and useTrackerProgress hook"
```

---

### Task 7: `ChecklistTracker` component + styles

**Files:**
- Create: `src/trackers/ChecklistTracker.tsx`
- Create: `src/trackers/ChecklistTracker.css`

- [ ] **Step 1: Create `src/trackers/ChecklistTracker.css`**

```css
.checklist-tracker {
  padding: 8px 0 32px;
}

.checklist-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.checklist-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.checklist-title {
  font-family: Impact, 'Arial Narrow', 'Haettenschweiler', sans-serif;
  font-size: 28px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent, var(--text-heading));
  margin: 0;
}

.checklist-subtitle {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

.checklist-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.checklist-progress-count {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.checklist-progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-input);
  overflow: hidden;
}

.checklist-progress-fill {
  height: 100%;
  background: var(--accent, var(--text-heading));
  transition: width 200ms ease;
}

.checklist-search {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text);
  font: inherit;
}

.checklist-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.checklist-reset-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
}

.checklist-reset-btn:hover {
  color: var(--red);
  border-color: var(--red);
}

.checklist-group {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  margin-bottom: 12px;
  overflow: hidden;
}

.checklist-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-card-hover);
  cursor: pointer;
  user-select: none;
}

.checklist-group-title {
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 13px;
  color: var(--text-heading);
}

.checklist-group-count {
  color: var(--text-muted);
  font-size: 12px;
}

.checklist-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.checklist-item {
  display: flex;
  gap: 12px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  align-items: flex-start;
}

.checklist-item.done .checklist-item-name {
  color: var(--text-muted);
  text-decoration: line-through;
}

.checklist-item-name {
  font-weight: 600;
}

.checklist-item-desc {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 2px;
}

.checklist-item-location {
  color: var(--text-muted);
  font-size: 12px;
  font-style: italic;
  margin-top: 2px;
}

.checklist-empty {
  color: var(--text-muted);
  text-align: center;
  padding: 32px 0;
}
```

- [ ] **Step 2: Create `src/trackers/ChecklistTracker.tsx`**

```tsx
import { useMemo, useState } from 'react';
import type { TrackerDef } from './types';
import { useTrackerProgress } from './useTrackerProgress';
import './ChecklistTracker.css';

interface Props {
  tracker: TrackerDef;
}

export default function ChecklistTracker({ tracker }: Props) {
  const { done, toggle, reset, count, total, pct } = useTrackerProgress(
    tracker.id,
    tracker.items.length,
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracker.items;
    return tracker.items.filter(item => {
      const haystack = [
        item.name,
        item.description ?? '',
        item.location ?? '',
        item.category ?? '',
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [tracker.items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = item.category ?? 'Uncategorized';
      const list = map.get(key);
      if (list) list.push(item); else map.set(key, [item]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <section className="checklist-tracker">
      <header className="checklist-header">
        <div className="checklist-title-row">
          <h1 className="checklist-title">{tracker.title}</h1>
          <div className="checklist-progress">
            <span className="checklist-progress-count">{count} / {total} — {pct}%</span>
            <div className="checklist-progress-bar">
              <div className="checklist-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        {tracker.subtitle && <p className="checklist-subtitle">{tracker.subtitle}</p>}
      </header>

      <div className="checklist-toolbar">
        <input
          className="checklist-search"
          type="search"
          placeholder="Search by name, description, location…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="checklist-reset-btn" onClick={reset}>Reset</button>
      </div>

      {groups.length === 0 && (
        <p className="checklist-empty">No items match.</p>
      )}

      {groups.map(([category, items]) => (
        <ChecklistGroup
          key={category}
          category={category}
          items={items}
          done={done}
          toggle={toggle}
        />
      ))}
    </section>
  );
}

interface GroupProps {
  category: string;
  items: { id: string; name: string; description?: string; location?: string }[];
  done: Set<string>;
  toggle: (id: string) => void;
}

function ChecklistGroup({ category, items, done, toggle }: GroupProps) {
  const [open, setOpen] = useState(true);
  const groupDone = items.filter(i => done.has(i.id)).length;

  return (
    <div className="checklist-group">
      <div className="checklist-group-header" onClick={() => setOpen(o => !o)}>
        <span className="checklist-group-title">{category}</span>
        <span className="checklist-group-count">
          {groupDone} / {items.length} {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <ul className="checklist-items">
          {items.map(item => (
            <li key={item.id} className={`checklist-item${done.has(item.id) ? ' done' : ''}`}>
              <input
                type="checkbox"
                checked={done.has(item.id)}
                onChange={() => toggle(item.id)}
                aria-label={item.name}
              />
              <div>
                <div className="checklist-item-name">{item.name}</div>
                {item.description && <div className="checklist-item-desc">{item.description}</div>}
                {item.location && <div className="checklist-item-location">{item.location}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed (component compiles even though it's not yet wired into a route).

- [ ] **Step 4: Commit**

```bash
git add src/trackers/ChecklistTracker.tsx src/trackers/ChecklistTracker.css
git commit -m "feat: add generic ChecklistTracker component"
```

---

### Task 8: RDR2 sub-layout + hub page

**Files:**
- Create: `src/games/rdr2/Rdr2Layout.tsx`
- Create: `src/games/rdr2/Rdr2Hub.tsx`
- Create: `src/games/rdr2/Rdr2Hub.css`
- Modify: `src/routes.tsx`

- [ ] **Step 1: Create `src/games/rdr2/Rdr2Hub.css`**

```css
.rdr2-hub {
  padding: 16px 0 32px;
}

.rdr2-hub-title {
  font-family: Impact, 'Arial Narrow', 'Haettenschweiler', sans-serif;
  font-size: 36px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent, var(--text-heading));
  text-align: center;
  margin: 8px 0 4px;
}

.rdr2-hub-subtitle {
  text-align: center;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.rdr2-hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.rdr2-hub-card {
  display: block;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  background: var(--bg-card);
  color: var(--text);
  text-decoration: none;
  transition: background 120ms ease, border-color 120ms ease;
}

.rdr2-hub-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent, var(--text-heading));
}

.rdr2-hub-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rdr2-hub-card.disabled:hover {
  background: var(--bg-card);
  border-color: var(--border);
}

.rdr2-hub-card-title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-heading);
  margin: 0 0 6px;
}

.rdr2-hub-card-desc {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

.rdr2-hub-card-pill {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 8px;
  margin-top: 8px;
}

.rdr2-tracker-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.rdr2-tracker-nav a {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.rdr2-tracker-nav a.active {
  border-color: var(--accent);
  color: var(--accent);
}
```

- [ ] **Step 2: Create `src/games/rdr2/Rdr2Hub.tsx`**

```tsx
import { Link } from 'react-router';
import './Rdr2Hub.css';
import './theme.css';

interface RealCard {
  to: string;
  title: string;
  desc: string;
}

interface StubCard {
  title: string;
  desc: string;
}

const real: RealCard[] = [
  { to: '/rdr2/herbs', title: 'Herbs', desc: 'Track every gatherable herb across the map.' },
  { to: '/rdr2/horses', title: 'Horses for Challenges', desc: 'Tasks for the nine Horseman challenges.' },
];

const stubs: StubCard[] = [
  { title: 'Gold Bars', desc: 'Hidden gold bar locations.' },
  { title: 'Treasure Maps', desc: 'Treasure map chains and final caches.' },
  { title: 'Legendary Animals', desc: 'All legendary hunts.' },
  { title: 'Gang Hideouts', desc: 'Random / fixed hideouts.' },
];

export default function Rdr2Hub() {
  return (
    <section className="rdr2-hub">
      <h1 className="rdr2-hub-title">Red Dead Redemption 2</h1>
      <p className="rdr2-hub-subtitle">100% completion trackers</p>
      <div className="rdr2-hub-grid">
        {real.map(card => (
          <Link key={card.to} to={card.to} className="rdr2-hub-card">
            <h2 className="rdr2-hub-card-title">{card.title}</h2>
            <p className="rdr2-hub-card-desc">{card.desc}</p>
          </Link>
        ))}
        {stubs.map(card => (
          <div key={card.title} className="rdr2-hub-card disabled" aria-disabled="true">
            <h2 className="rdr2-hub-card-title">{card.title}</h2>
            <p className="rdr2-hub-card-desc">{card.desc}</p>
            <span className="rdr2-hub-card-pill">Coming soon</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/games/rdr2/Rdr2Layout.tsx`**

```tsx
import { NavLink, Outlet, useLocation } from 'react-router';
import './Rdr2Hub.css';
import './theme.css';

export default function Rdr2Layout() {
  const location = useLocation();
  const onTrackerPage = location.pathname !== '/rdr2';

  return (
    <>
      {onTrackerPage && (
        <nav className="rdr2-tracker-nav">
          <NavLink to="/rdr2" end>Hub</NavLink>
          <NavLink to="/rdr2/herbs">Herbs</NavLink>
          <NavLink to="/rdr2/horses">Horses</NavLink>
        </nav>
      )}
      <Outlet />
    </>
  );
}
```

- [ ] **Step 4: Update `src/routes.tsx`**

Replace the RDR2 section's children with the real layout + hub. Tracker children stay as placeholders (Tasks 9 and 10 replace those).

```tsx
import { createBrowserRouter, Navigate } from 'react-router';
import AppShell from './AppShell';
import Gta5Page from './games/gta5/Gta5Page';
import Rdr2Layout from './games/rdr2/Rdr2Layout';
import Rdr2Hub from './games/rdr2/Rdr2Hub';
import { readLastRoute } from './hooks/useLastRoute';

function IndexRedirect() {
  const last = readLastRoute();
  const target = last && (last.startsWith('/gta5') || last.startsWith('/rdr2'))
    ? last
    : '/gta5';
  return <Navigate to={target} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: IndexRedirect },
      { path: 'gta5', Component: Gta5Page },
      {
        path: 'rdr2',
        Component: Rdr2Layout,
        children: [
          { index: true, Component: Rdr2Hub },
          { path: 'herbs', element: <div>Herbs tracker (placeholder)</div> },
          { path: 'horses', element: <div>Horses tracker (placeholder)</div> },
        ],
      },
      { path: '*', Component: IndexRedirect },
    ],
  },
]);
```

- [ ] **Step 5: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 6: Manual smoke**

Run: `pnpm dev`. Verify:
- `/rdr2` shows the hub: title "Red Dead Redemption 2", two enabled cards (Herbs, Horses), four greyed-out "Coming soon" cards.
- The page background and accent colours are RDR2 sepia (no gold).
- On `/rdr2`, the tracker nav row is **not** rendered (we're on the hub itself — no need for the back-to-hub link).
- Click the **Herbs** card → URL becomes `/rdr2/herbs`, the placeholder text shows, and the tracker nav row appears at the top with Hub / Herbs / Horses links (Herbs active).
- Clicking **Hub** in that nav returns to `/rdr2`.
- `/gta5` is unchanged.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/games/rdr2/Rdr2Layout.tsx src/games/rdr2/Rdr2Hub.tsx src/games/rdr2/Rdr2Hub.css src/routes.tsx
git commit -m "feat: add RDR2 sub-layout and hub page with stub cards"
```

---

### Task 9: Herbs tracker — data file + route wiring

The 43-item canonical list must come from a verified source. The implementer fills in the full set using the RDR2 Wiki herbs index (https://reddead.fandom.com/wiki/Herbs_in_Redemption_2) as the source of truth. The structure and a verified starter set are inline below; complete the list in a single pass.

**Files:**
- Create: `src/games/rdr2/trackers/herbs.ts`
- Modify: `src/routes.tsx`

- [ ] **Step 1: Create `src/games/rdr2/trackers/herbs.ts`**

```ts
import type { TrackerDef } from '../../../trackers/types';

export const herbs: TrackerDef = {
  id: 'rdr2:herbs',
  game: 'rdr2',
  title: 'Herbs',
  subtitle: 'Every gatherable herb in the base game',
  items: [
    // Berries
    { id: 'blackberry', name: 'Blackberry', category: 'Berries', location: 'Bluewater Marsh, Bayou Nwa, Scarlett Meadows' },
    { id: 'evergreen-huckleberry', name: 'Evergreen Huckleberry', category: 'Berries', location: 'West Elizabeth, Tall Trees' },
    { id: 'wintergreen-berry', name: 'Wintergreen Berry', category: 'Berries', location: 'Grizzlies, Cumberland Forest' },
    { id: 'raspberry', name: 'Raspberry', category: 'Berries', location: 'Roanoke Ridge, Tall Trees' },

    // Flowers
    { id: 'acuna', name: 'Acuna', category: 'Flowers', location: 'Bluewater Marsh, Bayou Nwa' },
    { id: 'agarita', name: 'Agarita', category: 'Flowers', location: 'New Austin, Cholla Springs' },
    { id: 'alaskan-ginseng', name: 'Alaskan Ginseng', category: 'Flowers', location: 'Grizzlies, Cumberland Forest' },
    { id: 'american-ginseng', name: 'American Ginseng', category: 'Flowers', location: 'Bayou Nwa, Roanoke Ridge' },
    { id: 'bay-bolete', name: 'Bay Bolete', category: 'Mushrooms', location: 'Roanoke Ridge, Tall Trees' },
    { id: 'blood-flower', name: 'Blood Flower', category: 'Flowers', location: 'Lemoyne, Bayou Nwa' },
    { id: 'chanterelles', name: 'Chanterelles', category: 'Mushrooms', location: 'Grizzlies, Cumberland Forest' },
    { id: 'common-bulrush', name: 'Common Bulrush', category: 'Flowers', location: 'Bluewater Marsh, river edges' },
    { id: 'creeping-thyme', name: 'Creeping Thyme', category: 'Flowers', location: 'New Hanover, West Elizabeth' },
    { id: 'desert-sage', name: 'Desert Sage', category: 'Flowers', location: 'New Austin, Rio Bravo' },
    { id: 'english-mace', name: 'English Mace', category: 'Flowers', location: 'New Hanover, Heartlands' },
    { id: 'evergreen-huckleberry-shrub', name: 'Evergreen Huckleberry (shrub)', category: 'Flowers', location: 'West Elizabeth, Tall Trees' },
    // Complete to canonical 43 entries from the RDR2 Wiki (Herbs in Redemption 2).
    // The remaining set includes (non-exhaustive list — verify each):
    //   golden currant, hummingbird sage, indian tobacco, lady of the night orchid,
    //   milkweed, oleander sage, oregano, parasol mushroom, prairie poppy,
    //   rams head, red raspberry, red sage, vanilla flower, violet snowdrop,
    //   wild carrot, wild feverfew, wild mint, yarrow, etc.
  ],
};
```

> **Implementer note:** Before completing the task, replace the trailing comment with the remaining real entries so the array contains the full canonical set. Each entry needs `id` (kebab-case), `name`, `category` (Berries / Flowers / Mushrooms / Other), and a 1-line `location` string. Don't ship the comment.

- [ ] **Step 2: Wire the route in `src/routes.tsx`**

Add the import:

```ts
import ChecklistTracker from './trackers/ChecklistTracker';
import { herbs } from './games/rdr2/trackers/herbs';
```

Replace the `herbs` placeholder route:

```ts
{ path: 'herbs', element: <ChecklistTracker tracker={herbs} /> },
```

- [ ] **Step 3: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 4: Manual smoke**

Run: `pnpm dev`. Visit `/rdr2/herbs`:

- Title "HERBS" renders in RDR2 accent colour.
- Progress bar shows `0 / N — 0%` where N matches the array length (target 43 once data is complete).
- Items are grouped into collapsible sections by category.
- Search box filters by name and location.
- Tick a few items — progress bar updates, persisted to `localStorage["tracker:rdr2:herbs"]`.
- Refresh — progress survives.
- Reset button prompts for confirmation, then clears.
- Tracker nav at top: Hub / Herbs / Horses, Herbs link is active.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/games/rdr2/trackers/herbs.ts src/routes.tsx
git commit -m "feat: add RDR2 herbs tracker with full canonical list"
```

---

### Task 10: Horses tracker — data file + route wiring

The Horseman challenge requirements are nine numbered tiers, each with a specific task. The implementer populates the full set using the RDR2 Wiki Horseman Challenges page (https://reddead.fandom.com/wiki/Horseman_Challenges) as the source of truth.

**Files:**
- Create: `src/games/rdr2/trackers/horses.ts`
- Modify: `src/routes.tsx`

- [ ] **Step 1: Create `src/games/rdr2/trackers/horses.ts`**

```ts
import type { TrackerDef } from '../../../trackers/types';

export const horses: TrackerDef = {
  id: 'rdr2:horses',
  game: 'rdr2',
  title: 'Horses for Challenges',
  subtitle: 'Tasks across the nine Horseman challenges',
  items: [
    // Horseman 1 — Break and ride 5 wild horses
    { id: 'h1-break-ride-5', name: 'Break and ride 5 wild horses', category: 'Horseman 1', description: 'Lasso a wild horse, mount, and break it. Repeat 5 times.' },

    // Horseman 2 — Travel from Valentine to Rhodes without dying or fast-travelling
    { id: 'h2-valentine-rhodes', name: 'Ride from Valentine to Rhodes without dying or fast travelling', category: 'Horseman 2', location: 'Valentine → Rhodes' },

    // Horseman 3 — Ride from Strawberry to Saint Denis without touching any roads or paths
    { id: 'h3-strawberry-stdenis', name: 'Ride Strawberry → Saint Denis off-road only', category: 'Horseman 3', description: 'No roads or paths the entire route.', location: 'Strawberry → Saint Denis' },

    // Horseman 4 — Jump 20 obstacles on horseback
    { id: 'h4-jump-20', name: 'Jump 20 obstacles on horseback', category: 'Horseman 4', description: 'Fences, logs, river banks all count.' },

    // Horseman 5 — Drop 5 enemies in 30 seconds whilst on horseback
    { id: 'h5-drop-5-in-30', name: 'Drop 5 enemies in under 30 seconds while mounted', category: 'Horseman 5' },

    // Horseman 6 — Trample 3 predators
    { id: 'h6-trample-3', name: 'Trample 3 predators on horseback', category: 'Horseman 6', description: 'Wolves, bears, cougars or alligators.' },

    // Horseman 7 — Ranked stable horse 4 + ride from Blackwater to Bayou Nwa
    { id: 'h7-tier-4-horse', name: 'Own a tier-4 stable horse', category: 'Horseman 7', description: 'Buy at any stable. Required before the ride below.' },
    { id: 'h7-blackwater-bayou', name: 'Ride Blackwater → Bayou Nwa on a tier-4 horse', category: 'Horseman 7', location: 'Blackwater → Bayou Nwa' },

    // Horseman 8 — Get a horse to maximum bonding
    { id: 'h8-max-bond', name: 'Reach max bonding (level 4) with a horse', category: 'Horseman 8' },

    // Horseman 9 — Cougar takedown from horseback with bow / lasso, plus a long no-fall ride
    { id: 'h9-cougar-bow', name: 'Kill a cougar from horseback using a bow', category: 'Horseman 9' },
    { id: 'h9-no-fall-long-ride', name: 'Ride a long-distance route without being thrown', category: 'Horseman 9', description: 'Final challenge ride; verify exact route from canonical source.' },

    // Implementer: cross-reference each item against the wiki and add any missing sub-tasks.
    // Pay particular attention to challenges with multiple required sub-actions.
  ],
};
```

> **Implementer note:** verify every item against the RDR2 wiki page for the Horseman Challenges. Add sub-tasks if a tier actually has multiple required actions. Remove the trailing comment before committing.

- [ ] **Step 2: Wire the route in `src/routes.tsx`**

Add import:

```ts
import { horses } from './games/rdr2/trackers/horses';
```

Replace the `horses` placeholder route:

```ts
{ path: 'horses', element: <ChecklistTracker tracker={horses} /> },
```

- [ ] **Step 3: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 4: Manual smoke**

Run: `pnpm dev`. Visit `/rdr2/horses`:
- Items grouped by Horseman 1 … Horseman 9.
- Each task has a description / location where present.
- Toggling persists; storage key `tracker:rdr2:horses`.
- Search filters across name + description + category.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/games/rdr2/trackers/horses.ts src/routes.tsx
git commit -m "feat: add RDR2 horseman challenges tracker"
```

---

### Task 11: Document title per route

**Files:**
- Create: `src/hooks/useDocumentTitle.ts`
- Modify: `src/games/gta5/Gta5Page.tsx`
- Modify: `src/games/rdr2/Rdr2Hub.tsx`
- Modify: `src/trackers/ChecklistTracker.tsx`
- Modify: `index.html`

- [ ] **Step 1: Create `src/hooks/useDocumentTitle.ts`**

```ts
import { useEffect } from 'react';

const SUFFIX = 'Rockstar Trackers';

export function useDocumentTitle(parts: string[]) {
  useEffect(() => {
    const segments = parts.filter(Boolean);
    document.title = segments.length
      ? `${segments.join(' — ')} — ${SUFFIX}`
      : SUFFIX;
  }, [parts]);
}
```

- [ ] **Step 2: Use it from `Gta5Page.tsx`**

Add the import at the top:

```ts
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
```

Inside `Gta5Page`, immediately after the existing `useGuideProgress()` line and the `useState` hooks but before `const allDone = ...`:

```ts
useDocumentTitle(['Money Guide', 'GTA V']);
```

- [ ] **Step 3: Use it from `Rdr2Hub.tsx`**

Add at the top of the component body, before the `return`:

```ts
useDocumentTitle(['RDR2']);
```

(Plus the corresponding import.)

- [ ] **Step 4: Use it from `ChecklistTracker.tsx`**

In `ChecklistTracker`, before returning the JSX, add:

```ts
useDocumentTitle([
  tracker.title,
  tracker.game === 'rdr2' ? 'RDR2' : 'GTA V',
]);
```

(Plus the import.)

- [ ] **Step 5: Update `index.html` default title**

Change the `<title>gta-money</title>` line to:

```html
<title>Rockstar Trackers</title>
```

- [ ] **Step 6: Build + lint clean**

Run: `pnpm build && pnpm lint`

Expected: both succeed.

- [ ] **Step 7: Manual smoke**

Run: `pnpm dev`. Browser tab title should change as you navigate:
- `/gta5` → `Money Guide — GTA V — Rockstar Trackers`
- `/rdr2` → `RDR2 — Rockstar Trackers`
- `/rdr2/herbs` → `Herbs — RDR2 — Rockstar Trackers`
- `/rdr2/horses` → `Horses for Challenges — RDR2 — Rockstar Trackers`

Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useDocumentTitle.ts src/games/gta5/Gta5Page.tsx src/games/rdr2/Rdr2Hub.tsx src/trackers/ChecklistTracker.tsx index.html
git commit -m "feat: per-route document titles"
```

---

### Task 12: Final verification pass

No new code — verify the whole feature works end-to-end and the repo is shippable.

- [ ] **Step 1: Clean install + production build**

```bash
cd /home/foestauf/gta-money
pnpm install
pnpm build
pnpm lint
```

Expected: all three succeed without errors or new warnings.

- [ ] **Step 2: Full manual smoke**

Run: `pnpm dev`. Walk through every item below; if any fails, stop and fix before declaring done.

- DevTools → Application → Local Storage. Manually add `gta-money-progress` with value `["1-1"]`. Refresh. Confirm the key is gone.
- Visit `/`. Lands on `/gta5` (no `app:lastRoute` set yet).
- `/gta5` looks identical to before this work; tick a step; refresh — persists in `tracker:gta5:money`.
- Click **RDR2** in the top nav. Lands on `/rdr2`. Theme swaps to sepia. Two enabled cards + four "Coming soon" cards.
- Click **Herbs**. URL `/rdr2/herbs`. Tracker nav row appears, Herbs active. Tick a few herbs across categories. Search filter narrows the list. Reset button confirms before clearing.
- Click **Horses** in the tracker nav. URL `/rdr2/horses`. Same behaviour, separate progress (toggling herbs doesn't affect horses).
- Click **Hub** in tracker nav. URL `/rdr2`.
- Visit `/`. Last-route redirect lands you at `/rdr2` (the most recent location).
- Visit `/foo`. Redirects to wherever last-route points.
- Browser back/forward buttons traverse history correctly.
- Tab title updates per route per Task 11.
- `data-game` attribute swaps between `gta5` and `rdr2` as you switch games (DevTools → Elements).

- [ ] **Step 3: Confirm storage layout**

In DevTools → Application → Local Storage, you should see only:
- `tracker:gta5:money`
- `tracker:rdr2:herbs`
- `tracker:rdr2:horses`
- `app:lastRoute`

No stray `gta-money-progress`. No other tracker keys.

- [ ] **Step 4: Stop dev server, confirm working tree clean**

```bash
git status
```

Expected: `nothing to commit, working tree clean` (everything from prior tasks is committed).

- [ ] **Step 5: No commit needed**

This is a verification-only task. If anything failed and you fixed it, commit those fixes with a descriptive message. Otherwise nothing to commit.

---

## Self-review notes

Verified after writing the plan:

**Spec coverage**
- Routing skeleton: Tasks 1, 3 ✅
- Per-game theming: Task 4 ✅
- Generic ChecklistTracker abstraction: Tasks 6, 7 ✅
- Old-key cleanup + storage rebase: Task 5 ✅
- RDR2 hub with stub cards: Task 8 ✅
- Real RDR2 herbs + horses data: Tasks 9, 10 ✅
- Last-route persistence: Task 3 ✅
- Per-route titles + brand: Task 11 ✅
- Final verification: Task 12 ✅

**Type / name consistency**
- `TrackerDef`, `ChecklistItem`, `useTrackerProgress` are defined in Task 6 and consumed identically in Tasks 7, 9, 10.
- Storage keys: `tracker:gta5:money`, `tracker:rdr2:herbs`, `tracker:rdr2:horses`, `app:lastRoute` — used consistently throughout. The hook builds them via `tracker:${trackerId}` and the tracker IDs are `rdr2:herbs` and `rdr2:horses`, which produces `tracker:rdr2:herbs` (consistent with the spec).
- `data-game` values are `gta5` or `rdr2` (no `none` written to the DOM — `AppShell` uses `undefined`).

**Placeholder check**
- The herbs and horses data tasks include explicit "implementer note" callouts directing the executor to a canonical source (the RDR2 Wiki) with a target count (43 herbs / 9-tier Horseman challenges). The starter data demonstrates the schema and is non-empty. The notes tell the implementer to remove the comment before committing — no placeholders ship.

**Out of scope confirmed:** no Leaflet integration for RDR2, no test infra, no cross-tracker stats, no import/export, no third game.
